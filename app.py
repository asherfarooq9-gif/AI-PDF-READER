# app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil

from backend.rag import build_index, ask_question

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    file_path = f"data/uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    build_index(file_path)

    return {"message": "PDF uploaded and processed"}


@app.get("/ask")
def ask(q: str):
    response = ask_question(q)
    return {"answer": response}