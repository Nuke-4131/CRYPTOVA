from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str | None
    profile_image_url: str | None
    role: str
    last_login_at: datetime


class GoogleAuthRequest(BaseModel):
    id_token: str
