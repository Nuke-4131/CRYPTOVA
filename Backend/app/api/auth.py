import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.database.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: str
    password: str
    display_name: str | None = None


def _supabase_auth(path: str, payload: dict) -> dict:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail={"code": "AUTH_NOT_CONFIGURED", "message": "Supabase authentication is not configured on the backend."})
    try:
        response = httpx.post(
            f"{settings.supabase_auth_url}/{path}",
            headers={"apikey": settings.supabase_anon_key, "Content-Type": "application/json"},
            json=payload,
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.json().get("msg", "Supabase authentication failed.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "AUTHENTICATION_FAILED", "message": detail}) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail={"code": "AUTH_PROVIDER_UNAVAILABLE", "message": "Supabase authentication is unavailable."}) from exc


def _auth_response(result: dict) -> dict:
    user = result.get("user") or {}
    metadata = user.get("user_metadata") or {}
    return {"success": True, "data": {"access_token": result.get("access_token"), "refresh_token": result.get("refresh_token"), "user": {"id": user.get("id"), "email": user.get("email"), "display_name": metadata.get("full_name") or metadata.get("name")}}}


@router.post("/register")
def register(credentials: Credentials):
    return _auth_response(_supabase_auth("signup", {"email": credentials.email, "password": credentials.password, "data": {"full_name": credentials.display_name} if credentials.display_name else {}}))


@router.post("/login")
def login(credentials: Credentials):
    return _auth_response(_supabase_auth("token?grant_type=password", {"email": credentials.email, "password": credentials.password}))


@router.get("/me")
def current_user(user: User = Depends(get_current_user)):
    return {"success": True, "data": {"id": user.id, "email": user.email, "display_name": user.display_name, "profile_image_url": user.profile_image_url, "role": user.role}}
