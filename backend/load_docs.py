from langchain_text_splitters import CharacterTextSplitter
from langchain_core.documents import Document

def load_documents():
    with open("dataset/docs.txt", "r", encoding="utf-8") as file:
        text = file.read()

    splitter = CharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)
    documents = [Document(page_content=chunk) for chunk in chunks]
    return documents