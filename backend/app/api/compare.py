"""
Routes for: compare
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.services.image_service import save_upload
from app.services.comparison_service import compare_products
from app.services.history_service import save_comparison_to_history
from app.api.deps import get_optional_user_id

router = APIRouter()


@router.post("/compare")
async def compare(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    user_id: str | None = Depends(get_optional_user_id),
):
    """
    Upload two food label images and get back a structured side-by-side
    comparison: nutrition deltas, ingredient notes, and a recommendation.

    If the request includes a valid Authorization header, the result is also
    saved to that user's scan history.
    """
    path_a = await save_upload(file_a)
    path_b = await save_upload(file_b)

    try:
        result = compare_products(path_a, path_b)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if user_id:
        await save_comparison_to_history(user_id, result)

    return result
