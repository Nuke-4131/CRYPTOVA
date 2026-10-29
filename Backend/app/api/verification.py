from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import User
from app.services.audit_service import record_event
from app.services.crypto_service import read_package
from app.services.integrity_service import verify_package
from app.services.vault_service import user_file

router = APIRouter(prefix="/api/files", tags=["verification"])


@router.post("/{file_id}/verify")
async def verify_file(file_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = user_file(db, user, file_id)
    if not record:
        raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": "Protected file not found."})
    try:
        package = read_package(record.storage_path)
        valid, message = verify_package(package, record.wrapped_key, record.key_nonce, record.mime_type)
    except (OSError, ValueError) as exc:
        valid, message = False, str(exc)
    record.verification_status = "VERIFIED" if valid else "FAILED"
    db.commit()
    await record_event(db, user, "INTEGRITY_VERIFIED" if valid else "INTEGRITY_VERIFICATION_FAILED", "SUCCESS" if valid else "FAILED", record.id, record.original_filename, message)
    return {"success": True, "data": {"format_valid": valid, "authentication_valid": valid, "integrity_valid": valid, "can_decrypt": valid, "message": message}}
