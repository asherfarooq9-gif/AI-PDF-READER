# backend/rag.py
import json
import ollama
from backend.pdf_loader import load_pdf
from backend.chunker import chunk_text
from backend.vector_db import store_chunks, search

# Use smallest model that fits your 12.1 GB RAM
# llama3.2:latest = 2.0 GB (safest)
# llama3.1:8b = 4.9 GB (needs more headroom)
# qwen2.5-coder:7b = 4.7 GB (needs more headroom)
MODEL_NAME = "llama3.2:latest"

# Conversation memory per session (simple in-memory store)
conversation_history = []


def build_index(pdf_path):
    text = load_pdf(pdf_path)
    chunks = chunk_text(text)
    store_chunks(chunks)


def ask_question(question):
    # Retrieve relevant chunks
    context = search(question)
    
    # Build prompt with system instructions
    prompt = f"""You are an expert document analyst with access to the following excerpts:

{context}

INSTRUCTIONS:
- Answer using ONLY the provided context
- If the answer isn't in the context, say: "I couldn't find that in the document."
- Be specific: cite sections or quotes when possible
- For complex questions, break down your reasoning step by step
- If asked to format (table, JSON, bullet points), follow the requested format
- If the question is vague, ask for clarification

USER QUESTION: {question}

YOUR ANSWER:"""

    # Call Ollama with memory-safe options
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_ctx": 2048,      # reduce context window to save RAM
            "temperature": 0.2,   # focused, factual responses
            "top_p": 0.9,
        }
    )
    
    raw_answer = response["message"]["content"]
    
    # Generate follow-up questions based on the answer
    followups = generate_followups(question, raw_answer, context)
    
    return {
        "answer": raw_answer,
        "followups": followups
    }


def generate_followups(original_question, answer, context):
    """Generate 3 natural follow-up questions the user might ask."""
    
    followup_prompt = f"""Based on this document Q&A, suggest 3 follow-up questions the user might want to ask next.

Original question: {original_question}
Answer: {answer}

Generate exactly 3 short, natural follow-up questions. Return ONLY a JSON array of strings.
Example: ["What does X mean?", "How does Y relate to Z?", "Can you explain W in more detail?"]"""

    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": followup_prompt}],
            options={
                "num_ctx": 1024,
                "temperature": 0.7,  # more creative for follow-ups
            }
        )
        
        content = response["message"]["content"].strip()
        
        # Extract JSON if wrapped in markdown
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        parsed = json.loads(content)
        
        # Validate: must be array of 3 strings
        if isinstance(parsed, list) and len(parsed) == 3:
            return parsed
        elif isinstance(parsed, list):
            return parsed[:3]
        else:
            return []
            
    except Exception:
        # Silently fail — follow-ups are optional
        return []


def ask_with_history(question):
    """Multi-turn conversation with memory of previous Q&A."""
    
    global conversation_history
    
    # Build context from history (last 3 exchanges)
    history_context = ""
    for msg in conversation_history[-6:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_context += f"{role}: {msg['content']}\n"
    
    # Retrieve relevant chunks
    context = search(question)
    
    prompt = f"""You are an expert document analyst. You have access to the following document excerpts:

{context}

CONVERSATION HISTORY:
{history_context}

INSTRUCTIONS:
- Answer using ONLY the provided document context
- Refer to conversation history for follow-up questions (e.g., "What did you mean by..." or "Tell me more about...")
- If the answer isn't in the context, say: "I couldn't find that in the document."

USER QUESTION: {question}

YOUR ANSWER:"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_ctx": 4096,  # larger for history
            "temperature": 0.2,
        }
    )
    
    answer = response["message"]["content"]
    
    # Store exchange
    conversation_history.append({"role": "user", "content": question})
    conversation_history.append({"role": "assistant", "content": answer})
    
    # Keep only last 10 exchanges to prevent memory bloat
    conversation_history = conversation_history[-20:]
    
    followups = generate_followups(question, answer, context)
    
    return {
        "answer": answer,
        "followups": followups
    }


def clear_history():
    """Reset conversation memory."""
    global conversation_history
    conversation_history = []


def analyze_document(analysis_type):
    """Run specific analysis types on the full document."""
    
    # Retrieve larger context for analysis
    context = search("summarize full document", top_k=10)
    
    analyses = {
        "summary": "Summarize the entire document in 3 clear paragraphs. Cover the main purpose, key findings, and conclusions.",
        "entities": "List all people, organizations, locations, and technical terms mentioned. Format as a structured list.",
        "timeline": "Extract all dates, deadlines, and events in chronological order. Format as a timeline.",
        "sentiment": "Analyze the overall tone and sentiment. Is it positive, negative, neutral, or mixed? Explain why.",
        "key_findings": "What are the 5 most important findings or takeaways? Number them.",
        "action_items": "List all tasks, action items, deadlines, and responsible parties mentioned.",
        "definitions": "Define all technical terms, acronyms, and jargon used. Format as a glossary.",
        "contradictions": "Find any internal contradictions, inconsistencies, or conflicting statements. Quote them.",
        "statistics": "Extract and summarize all numerical data, statistics, percentages, and figures.",
        "risks": "Identify all risks, warnings, caveats, or negative outcomes mentioned.",
    }
    
    if analysis_type not in analyses:
        return {"answer": f"Unknown analysis type: {analysis_type}", "followups": []}
    
    prompt = f"""You are an expert document analyst. Analyze the following document excerpts:

{context}

ANALYSIS REQUEST: {analyses[analysis_type]}

Provide a thorough, well-structured response using ONLY the provided context."""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_ctx": 4096,
            "temperature": 0.3,
        }
    )
    
    answer = response["message"]["content"]
    followups = generate_followups(analysis_type, answer, context)
    
    return {
        "answer": answer,
        "followups": followups
    }