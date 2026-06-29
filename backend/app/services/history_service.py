"""
Saves analysis/comparison results into the user's scan history (Phase 5).
Called optionally from /analyze and /compare when a user is authenticated.
"""

from datetime import datetime, timezone

from app.database.connection import get_history_collection


async def save_analysis_to_history(user_id: str, result: dict):
    history = get_history_collection()
    doc = {
        "user_id": user_id,
        "kind": "analysis",
        "ingredients": result.get("ingredients", []),
        "nutrition": result.get("nutrition", {}),
        "explanation": result.get("explanation", {}),
        "created_at": datetime.now(timezone.utc),
    }
    await history.insert_one(doc)


async def save_comparison_to_history(user_id: str, result: dict):
    history = get_history_collection()
    doc = {
        "user_id": user_id,
        "kind": "comparison",
        "product_a": {
            "ingredients": result.get("product_a", {}).get("ingredients", []),
            "nutrition": result.get("product_a", {}).get("nutrition", {}),
        },
        "product_b": {
            "ingredients": result.get("product_b", {}).get("ingredients", []),
            "nutrition": result.get("product_b", {}).get("nutrition", {}),
        },
        "comparison": result.get("comparison", {}),
        "created_at": datetime.now(timezone.utc),
    }
    await history.insert_one(doc)
