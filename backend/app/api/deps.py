"""
Shared FastAPI dependencies (e.g. extracting the current authenticated user).
"""

from fastapi import Header, HTTPException

from app.services.auth_service import decode_access_token


def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Required auth. Expects an `Authorization: Bearer <token>` header.
    Raises 401 if missing or invalid. Use for routes that must be logged in.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header.")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        return decode_access_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_optional_user_id(authorization: str = Header(None)) -> str | None:
    """
    Optional auth. Returns the user_id if a valid token is present, otherwise None.
    Use for routes that work for both guests and logged-in users (e.g. /analyze,
    /compare), where being logged in just means the result also gets saved to history.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    try:
        return decode_access_token(token)
    except ValueError:
        return None
