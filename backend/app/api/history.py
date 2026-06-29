"""
Routes for: history
"""

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.api.deps import get_current_user_id
from app.database.connection import get_history_collection
from app.models.history import HistoryEntry

router = APIRouter()


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user_id)):
    """Return all scan history entries for the authenticated user, most recent first."""
    history = get_history_collection()
    cursor = history.find({"user_id": user_id}).sort("created_at", -1)
    entries = [_serialize(doc) async for doc in cursor]
    return entries


@router.delete("/history/{entry_id}")
async def delete_history_entry(entry_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a single scan history entry, only if it belongs to the requesting user."""
    history = get_history_collection()

    try:
        oid = ObjectId(entry_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid history entry id.")

    result = await history.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History entry not found.")

    return {"status": "deleted", "id": entry_id}
