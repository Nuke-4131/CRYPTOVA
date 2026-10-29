from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import ProtectedFile, User
from app.services.audit_service import record_event
from app.services.crypto_service import encrypt_bytes, write_package
from app.services.encryption_limits import MAX_FILE_SIZE, validate_filename

router = APIRouter(prefix="/api/files", tags=["encryption"])


@router.post("/encrypt")
async def encrypt_file(upload: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    contents = await upload.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail={"code": "FILE_TOO_LARGE", "message": "Files must be 100 MB or smaller."})
    try:
        original_name = validate_filename(upload.filename or "file")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_FILE_TYPE", "message": str(exc)}) from exc
    package, wrapped_key, key_nonce = encrypt_bytes(contents, original_name, upload.content_type or "application/octet-stream")
    stored_name, storage_path = write_package(package)
    record = ProtectedFile(user_id=user.id, original_filename=original_name, stored_filename=stored_name, file_size=len(contents), mime_type=upload.content_type or "application/octet-stream", storage_path=storage_path, wrapped_key=wrapped_key, key_nonce=key_nonce)
    db.add(record)
    db.commit()
    db.refresh(record)
    await record_event(db, user, "FILE_ENCRYPTED", "SUCCESS", record.id, record.original_filename, "File encrypted and stored in the user vault.")
    return {"success": True, "data": {"id": record.id, "filename": record.original_filename, "status": record.verification_status}}
