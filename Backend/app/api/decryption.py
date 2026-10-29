from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import User
from app.services.audit_service import record_event
from app.services.crypto_service import decrypt_bytes, read_package
from app.services.integrity_service import verify_package
from app.services.vault_service import user_file

router = APIRouter(prefix="/api/files", tags=["decryption"])


@router.get("/{file_id}/decrypt")
async def decrypt_file(file_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = user_file(db, user, file_id)
    if not record:
        raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": "Protected file not found."})
    package = read_package(record.storage_path)
    valid, message = verify_package(package, record.wrapped_key, record.key_nonce, record.mime_type)
    if not valid:
        await record_event(db, user, "INTEGRITY_VERIFICATION_FAILED", "FAILED", record.id, record.original_filename, message)
        raise HTTPException(status_code=422, detail={"code": "INTEGRITY_VERIFICATION_FAILED", "message": "Decryption was blocked because the package could not be authenticated."})
    try:
        plaintext = decrypt_bytes(package, record.wrapped_key, record.key_nonce, record.mime_type)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail={"code": "DECRYPTION_FAILED", "message": "The protected package could not be decrypted."}) from exc
    await record_event(db, user, "FILE_DECRYPTED", "SUCCESS", record.id, record.original_filename, "File decrypted after verification.")
    return StreamingResponse(iter([plaintext]), media_type=record.mime_type, headers={"Content-Disposition": f'attachment; filename="{record.original_filename}"'})
