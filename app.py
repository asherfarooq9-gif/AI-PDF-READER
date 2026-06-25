# app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from backend.rag import build_index, ask_question, ask_with_history, clear_history, analyze_document

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs("data/uploads", exist_ok=True)


@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    file_path = f"data/uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    build_index(file_path)

    return {"message": "PDF uploaded and processed"}


@app.get("/ask")
def ask(q: str):
    """Standard Q&A with follow-up suggestions."""
    response = ask_question(q)
    return {
        "answer": response["answer"],
        "followups": response["followups"]
    }


@app.get("/ask-with-history")
def ask_history(q: str):
    """Multi-turn conversation with memory."""
    response = ask_with_history(q)
    return {
        "answer": response["answer"],
        "followups": response["followups"]
    }


@app.get("/analyze")
def analyze(type: str):
    """Run specific analysis on the full document."""
    response = analyze_document(type)
    return {
        "answer": response["answer"],
        "followups": response["followups"]
    }


@app.post("/clear-history")
def clear():
    """Reset conversation memory."""
    clear_history()
    return {"message": "Conversation history cleared"}


@app.get("/health")
def health_check():
    """Check if backend is running."""
    return {"status": "ok", "model": "llama3.2:latest"}