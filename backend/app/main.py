"""
NutriLens AI - FastAPI entrypoint.

All phases (1-6) wired in: OCR/analysis, RAG explanations, chat, comparison,
auth/history, and CORS configured for deployment.
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    import threading
    def build_in_background():
        try:
            vector_db_dir = os.getenv("CHROMA_PERSIST_DIR", "../vector_db")
            knowledge_base_dir = os.path.join(
                os.path.dirname(__file__), "..", "..", "knowledge_base"
            )
            kb_files = [
                f for f in os.listdir(knowledge_base_dir)
                if not f.startswith(".") and f != "README.md"
            ] if os.path.exists(knowledge_base_dir) else []

            db_has_data = (
                os.path.exists(vector_db_dir)
                and any(
                    f for f in os.listdir(vector_db_dir)
                    if not f.startswith(".")
                )
            )

            if kb_files and not db_has_data:
                print(f"Building knowledge base in background...")
                from app.rag.retriever import build_knowledge_base
                build_knowledge_base()
                print("Knowledge base built successfully.")
            elif db_has_data:
                print("Knowledge base already exists, skipping build.")
            else:
                print("No knowledge base files found, skipping RAG build.")
        except Exception as e:
            print(f"Knowledge base build error: {e}")

    thread = threading.Thread(target=build_in_background, daemon=True)
    thread.start()
    yield


app = FastAPI(
    title="NutriLens AI",
    description="AI-powered food label analyzer and product comparison platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# In production, set FRONTEND_ORIGIN to the deployed Vercel URL.
# Falls back to "*" for local development convenience.
_frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_origin] if _frontend_origin != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "NutriLens AI backend"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


from app.api import upload, analyze, admin, chat, compare, auth, history

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(admin.router)
app.include_router(chat.router)
app.include_router(compare.router)
app.include_router(auth.router)
app.include_router(history.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)