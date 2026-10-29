from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.security import bearer, verify_supabase_token
from app.database.database import get_db
from app.database.models import User


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    claims = verify_supabase_token(credentials)
    subject = claims.get("id")
    email = claims.get("email")
    if not subject or not email:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail={"code": "AUTHENTICATION_INVALID", "message": "The identity token has no usable user identity."})
    user = db.query(User).filter(User.provider == "supabase", User.provider_subject == subject).first()
    if not user:
        metadata = claims.get("user_metadata") or {}
        user = User(provider="supabase", provider_subject=subject, email=email, display_name=metadata.get("full_name") or metadata.get("name"))
        db.add(user)
    else:
        user.email = email
        user.display_name = claims.get("name") or user.display_name
        user.profile_image_url = claims.get("picture") or user.profile_image_url
    from app.database.models import utc_now
    user.last_login_at = utc_now()
    db.commit()
    db.refresh(user)
    return user
