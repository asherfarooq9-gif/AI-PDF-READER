from sentence_transformers import SentenceTransformer  # model for embeddings

model = SentenceTransformer("all-MiniLM-L6-v2")  # lightweight pre-trained model

def get_embeddings(text_list):  # takes list of text chunks
    embeddings = model.encode(text_list)  # converts text → vectors (numbers)
    return embeddings  # return vector list