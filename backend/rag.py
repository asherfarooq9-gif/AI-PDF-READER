# backend/rag.py
from backend.pdf_loader import load_pdf
from backend.chunker import chunk_text
from backend.vector_db import store_chunks, search

import ollama

# Use smallest model that fits your 12.1 GB RAM
# llama3.2:latest = 2.0 GB (safest)
# llama3.1:8b = 4.9 GB (may fail with overhead)
# qwen2.5-coder:7b = 4.7 GB (may fail with overhead)
MODEL_NAME = "llama3.2:latest"

def build_index(pdf_path):
    text = load_pdf(pdf_path)
    chunks = chunk_text(text)
    store_chunks(chunks)


def ask_question(question):
    context = search(question)

    prompt = f"""You are a helpful AI assistant.

Answer ONLY using the provided context.

If the answer is not found in the context, say:
"I could not find that information in the document."

Context:
{context}

Question:
{question}"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_ctx": 2048,        # reduce context window to save RAM
            "temperature": 0.3,     # focused, factual responses
        }
    )

    return response["message"]["content"]