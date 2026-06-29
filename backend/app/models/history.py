"""
Pydantic models for the `history` MongoDB collection (scan history).
"""

from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class HistoryEntry(BaseModel):
    id: Optional[str] = None
    user_id: str
    kind: str = "analysis"  # "analysis" or "comparison"
    ingredients: List[str] = []
    nutrition: Dict = {}
    explanation: Dict = {}
    created_at: datetime = None
