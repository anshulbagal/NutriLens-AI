"""
Routes for: auth (signup, login)
"""

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.models.user import UserCreate, UserLogin, TokenResponse, UserOut
from app.database.connection import get_users_collection
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserCreate):
    users = get_users_collection()

    existing = await users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user_doc = {
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
    }
    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user=UserOut(id=user_id, email=payload.email))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    users = get_users_collection()

    user_doc = await users.find_one({"email": payload.email})
    if not user_doc or not verify_password(payload.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user_id = str(user_doc["_id"])
    token = create_access_token(user_id)
    return TokenResponse(access_token=token, user=UserOut(id=user_id, email=user_doc["email"]))
