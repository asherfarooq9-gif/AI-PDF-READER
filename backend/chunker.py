def chunk_text(text):
    # convert full text into words
    words = text.split()

    chunks = []  # final list of chunks
    chunk_size = 200  # number of words per chunk

    # step through words in blocks of chunk_size
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])  # join words back into text
        chunks.append(chunk)  # store chunk

    return chunks  # return list of text chunks