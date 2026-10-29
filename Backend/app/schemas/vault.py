from datetime import datetime
from pydantic import BaseModel


class FileResponse(BaseModel):
    id: str
    original_filename: str
    file_size: int
    mime_type: str
    algorithm: str
    verification_status: str
    created_at: datetime


class VerificationResponse(BaseModel):
    format_valid: bool
    authentication_valid: bool
    integrity_valid: bool
    can_decrypt: bool
    message: str
