"""
MongoDB Atlas connection setup.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None
_db = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI is not set in the environment.")
        _client = AsyncIOMotorClient(uri)
    return _client


def get_database():
    global _db
    if _db is None:
        _db = get_client()["nutrilens"]
    return _db


def get_users_collection():
    return get_database()["users"]


def get_history_collection():
    return get_database()["history"]


def get_cached_analysis_collection():
    return get_database()["cached_analysis"]


def get_products_collection():
    return get_database()["products"]
