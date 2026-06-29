"""
Routes for: chat
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional

from app.services.llm_service import chat_response

router = APIRouter()


class ChatTurn(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatTurn] = []
    product_context: Dict = {}


@router.post("/chat")
def chat(request: ChatRequest):
    """
    Conversational follow-up grounded in a previously analyzed product.
    The frontend sends the product's analysis result as `product_context`
    plus the running chat history, so each turn stays grounded.
    """
    reply = chat_response(
        history=[turn.dict() for turn in request.history],
        user_message=request.message,
        product_context=request.product_context,
    )
    return {"reply": reply}
