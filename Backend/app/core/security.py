import httpx
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import get_settings

bearer = HTTPBearer(auto_error=False)

def verify_supabase_token(credentials: HTTPAuthorizationCredentials | None) -> dict:
    settings = get_settings()
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "AUTHENTICATION_REQUIRED", "message": "A Supabase bearer token is required."})
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail={"code": "AUTH_NOT_CONFIGURED", "message": "Supabase authentication is not configured on the backend."})
    try:
        response = httpx.get(
            f"{settings.supabase_auth_url}/user",
            headers={"Authorization": f"Bearer {credentials.credentials}", "apikey": settings.supabase_anon_key},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "AUTHENTICATION_INVALID", "message": "The Supabase access token is invalid or expired."}) from exc
