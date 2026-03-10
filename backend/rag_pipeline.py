from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFacePipeline
from transformers import pipeline
from load_docs import load_documents


# -------------------------
# Load documents
# -------------------------
documents = load_documents()


# -------------------------
# Embedding model
# -------------------------
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# -------------------------
# Create vector database
# -------------------------
vector_db = FAISS.from_documents(documents, embeddings)


# -------------------------
# LLM pipeline (Flan-T5 - instruction following)
# -------------------------
generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    max_new_tokens=150
)

llm = HuggingFacePipeline(pipeline=generator)


# -------------------------
# Relevance check (hallucination blocker)
# -------------------------
def is_relevant(query, docs, threshold=0.3):
    query_words = set(query.lower().split())
    for doc in docs:
        doc_words = set(doc.page_content.lower().split())
        overlap = query_words & doc_words
        if len(overlap) / max(len(query_words), 1) >= threshold:
            return True
    return False


# -------------------------
# RAG function
# -------------------------
def ask_question(query):

    docs = vector_db.similarity_search(query, k=3)

    if not docs:
        return {
            "answer": "I don't have enough information to answer that question.",
            "sources": [],
            "similarity_scores": []
        }

    # Hallucination blocker — reject low-relevance queries
    if not is_relevant(query, docs):
        return {
            "answer": "I couldn't find relevant information in the documentation to answer your question.",
            "sources": [],
            "similarity_scores": []
        }

    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""Answer the question based only on the context below. 
If the answer is not in the context, say "I don't know".

Context: {context}

Question: {query}
Answer:"""

    result = llm.invoke(prompt)

    # Extract clean answer
    if isinstance(result, str):
        answer = result.strip()
    else:
        answer = str(result).strip()

    # Fallback if answer is empty or too short
    if not answer or len(answer) < 3:
        answer = "I don't have enough information to answer that question."

    sources = [doc.page_content for doc in docs]

    return {
        "answer": answer,
        "sources": sources
    }