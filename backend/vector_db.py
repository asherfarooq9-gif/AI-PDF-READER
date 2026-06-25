import chromadb
from backend.embeddings import get_embeddings

client = chromadb.PersistentClient(path="./data/chroma_db")
collection = client.get_or_create_collection("rag_docs")

def store_chunks(chunks):
    # Clear old data first
    try:
        client.delete_collection("rag_docs")
    except:
        pass
    global collection
    collection = client.get_or_create_collection("rag_docs")
    
    embeddings = get_embeddings(chunks)
    for i, chunk in enumerate(chunks):
        collection.add(
            ids=[str(i)],
            documents=[chunk],
            embeddings=[embeddings[i].tolist()]
        )

def search(query):
    results = collection.query(
        query_texts=[query],
        n_results=3
    )
    docs = results["documents"][0]
    return "\n\n".join(docs)