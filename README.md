# 🤖 SaaS AI Copilot — RAG-Based Support Assistant

> **NeuroStack GenAI Build Sprint — Problem Statement 1: SaaS Support Copilot**

---

## 🔗 Live Links

| | URL |
|---|---|
| 🌐 **Frontend (Live App)** | https://aicopilot-frontend.vercel.app |
| ⚙️ **Backend API** | https://kishorem2510-aicopilot-backend.hf.space |
| 📖 **API Docs (Swagger)** | https://kishorem2510-aicopilot-backend.hf.space/docs |
| 💻 **GitHub Repository** | https://github.com/kishorem2510/aicopilot |

---

## 📌 Overview

**SaaS AI Copilot** is a production-ready Retrieval-Augmented Generation (RAG) support assistant. It answers user questions by retrieving relevant documentation chunks and generating grounded, accurate answers using a free open-source LLM — with zero hallucination risk on out-of-context queries.

Users can sign up, log in, and chat with the AI assistant. Every answer includes the retrieved source chunks and their similarity scores for full transparency.

---

## 🏗️ Architecture

```
User (Browser)
     │
     ▼
Next.js Frontend (Vercel)
     │  JWT Token in header
     ▼
FastAPI Backend (Hugging Face Spaces)
     │
     ├──► Authentication Layer (JWT + SQLite)
     │         │
     │         ▼
     └──► RAG Pipeline
               │
               ├──► Query → HuggingFace Embeddings (all-MiniLM-L6-v2)
               │
               ├──► FAISS Vector DB → Similarity Search (Top 3 chunks)
               │
               ├──► Relevance Check (Hallucination Blocker)
               │
               └──► Flan-T5 LLM → Grounded Answer
                         │
                         ▼
               Response: { answer, sources, similarity_scores }
```

---

## 🔄 GenAI Workflow

### Step-by-step RAG Pipeline:

1. **Document Loading** — `docs.txt` (20+ FAQ items) is loaded and split into 300-character chunks with 50-character overlap using `CharacterTextSplitter`

2. **Embedding** — Each chunk is embedded using `sentence-transformers/all-MiniLM-L6-v2` (free, lightweight, accurate)

3. **Vector Storage** — Embeddings stored in a **FAISS** in-memory vector database for fast similarity search

4. **Query Processing** — User query is embedded and top-3 most similar chunks are retrieved using `similarity_search_with_score`

5. **Hallucination Blocking** — A word-overlap relevance check runs before calling the LLM. If the query has less than 30% overlap with retrieved chunks, it's rejected with a safe fallback response

6. **Answer Generation** — Retrieved chunks are passed as context to `google/flan-t5-base` with a strict prompt: *"Answer only from the context below"*

7. **Response** — Returns `{ answer, sources, similarity_scores }` for full transparency

---

## 🛡️ Hallucination Reduction Techniques

| Technique | Implementation |
|---|---|
| **Context-only prompting** | LLM instructed to answer ONLY from provided context |
| **Relevance threshold check** | Queries with <30% word overlap with docs are rejected |
| **Fallback response** | Low-context queries return a safe "I don't know" message |
| **Instruction-following model** | Flan-T5 (seq2seq) used instead of GPT-2 (causal) for better grounding |
| **Top-K retrieval** | Only top 3 most relevant chunks passed to LLM to reduce noise |

---

## ⚡ Token Optimization

- Chunk size set to **300 characters** — small enough for precision, large enough for context
- Only **top 3 chunks** passed to LLM — avoids exceeding context window
- `max_new_tokens=150` — prevents runaway generation
- Prompt is minimal and direct — no unnecessary instructions

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | REST API framework |
| SQLAlchemy + SQLite | User database |
| JWT (python-jose) | Authentication tokens |
| Passlib + bcrypt | Password hashing |
| LangChain | RAG pipeline orchestration |
| FAISS | Vector similarity search |
| HuggingFace Transformers | LLM inference |
| Flan-T5-base | Answer generation |
| all-MiniLM-L6-v2 | Text embeddings |

### Frontend
| Tool | Purpose |
|---|---|
| Next.js 15 | React framework |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Deployment
| Service | Purpose |
|---|---|
| Hugging Face Spaces | Backend hosting (Docker) |
| Vercel | Frontend hosting |
| GitHub | Source code |

---

## 📁 Project Structure

```
aicopilot/
├── backend/
│   ├── main.py              # FastAPI app, routes, auth endpoints
│   ├── rag_pipeline.py      # RAG logic, FAISS, LLM pipeline
│   ├── load_docs.py         # Document loading and chunking
│   ├── auth.py              # JWT token creation and validation
│   ├── database.py          # SQLAlchemy database setup
│   ├── models.py            # User model
│   ├── Dockerfile           # HF Spaces deployment
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── login/page.tsx   # Login page
│   │   ├── signup/page.tsx  # Signup page
│   │   ├── chat/page.tsx    # Chat interface
│   │   └── layout.tsx       # Root layout
│   └── package.json
└── dataset/
    └── docs.txt             # 20+ FAQ documentation items
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or SQLite for local dev)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/kishorem2510/aicopilot.git
cd aicopilot/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`
API docs at: `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
cd aicopilot/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🧪 Sample Test Inputs

Try these questions in the chat:

```
How do I reset my password?
How to cancel subscription?
How to enable two-factor authentication?
How to generate an API key?
How to contact support?
How to update payment method?
How to delete my account?
```

**Out-of-scope test (hallucination blocker):**
```
What is the weather today?
→ Expected: "I couldn't find relevant information in the documentation"
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register new user | ❌ |
| POST | `/login` | Login and get JWT token | ❌ |
| POST | `/ask` | Ask a question (RAG) | ✅ Bearer Token |

### Example `/ask` Request:
```json
POST /ask
Authorization: Bearer <token>

{
  "question": "How do I reset my password?"
}
```

### Example `/ask` Response:
```json
{
  "answer": "Go to Settings → Security → Reset Password.",
  "sources": [
    "How to reset password:\nGo to Settings → Security → Reset Password.",
    "How to change password:\nGo to security settings → change password."
  ],
  "similarity_scores": [0.2134, 0.4521, 0.6789]
}
```

---



## 👨‍💻 Author

**Kishore M**
- GitHub: [@kishorem2510](https://github.com/kishorem2510)
- Hugging Face: [@kishorem2510](https://huggingface.co/kishorem2510)

---

## 📄 License

MIT License — free to use and modify.
