"""
NutriLens AI - FastAPI entrypoint.

All phases (1-6) wired in: OCR/analysis, RAG explanations, chat, comparison,
auth/history, and CORS configured for deployment.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="NutriLens AI",
    description="AI-powered food label analyzer and product comparison platform.",
    version="1.0.0",
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