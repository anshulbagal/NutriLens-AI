"""
Routes for: upload
"""

from fastapi import APIRouter, UploadFile, File

from app.services.image_service import save_upload

router = APIRouter()


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload a single food label image. Returns the saved server-side path."""
    filepath = await save_upload(file)
    return {"filepath": filepath, "filename": file.filename}
