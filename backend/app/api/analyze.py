"""
Routes for: analyze
"""

import asyncio
from functools import partial

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.services.image_service import save_upload
from app.services.analysis_service import analyze_image
from app.services.explanation_service import explain_product
from app.services.history_service import save_analysis_to_history
from app.api.deps import get_optional_user_id

router = APIRouter()


@router.post("/analyze")
async def analyze_product(
    file: UploadFile = File(...),
    user_id: str | None = Depends(get_optional_user_id),
):
    """
    Upload a single food label image and get back extracted ingredients,
    nutrition facts, allergen mentions, plus a RAG-grounded explanation,
    health score, and AI summary.

    If the request includes a valid Authorization header, the result is also
    saved to that user's scan history.

    NOTE: OCR (EasyOCR) and LLM calls are CPU/IO-bound and run in a thread
    pool executor so they don't block the async event loop.
    """
    filepath = await save_upload(file)

    loop = asyncio.get_event_loop()

    try:
        # Run blocking OCR + parsing in a thread pool
        extraction = await loop.run_in_executor(None, analyze_image, filepath)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))

    if not extraction.get("ingredients") and not extraction.get("nutrition"):
        # Nothing meaningful was extracted (e.g. blank/unreadable image) -
        # skip the LLM call rather than burning a request on empty input.
        return extraction

    try:
        # Run blocking LLM call in a thread pool
        result = await loop.run_in_executor(None, explain_product, extraction)
    except RuntimeError as e:
        # e.g. API key missing - return Phase 1 data with a warning
        # rather than a hard failure.
        extraction["explanation_error"] = str(e)
        result = extraction

    if user_id:
        await save_analysis_to_history(user_id, result)

    return result

