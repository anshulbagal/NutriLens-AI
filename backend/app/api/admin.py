"""
Routes for: admin / maintenance tasks (not part of the public REST API spec,
but needed operationally to (re)build the RAG knowledge base).
"""

from fastapi import APIRouter, HTTPException

from app.rag.retriever import build_knowledge_base

router = APIRouter()


@router.post("/admin/build-knowledge-base")
def rebuild_knowledge_base():
    """
    Re-chunks and re-embeds every PDF in knowledge_base/ into vector_db/.
    Run this after adding/updating reference documents (ingredient glossaries,
    FDA/WHO guidance, allergen info, etc).
    """
    try:
        stats = build_knowledge_base()
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", **stats}
