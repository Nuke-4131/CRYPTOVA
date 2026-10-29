from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import ProtectedFile, User
from app.services.audit_service import record_event
from app.services.vault_service import user_file

router = APIRouter(prefix="/api/vault", tags=["vault"])


def serialize(record: ProtectedFile) -> dict:
    return {"id": record.id, "original_filename": record.original_filename, "file_size": record.file_size, "mime_type": record.mime_type, "algorithm": record.algorithm, "verification_status": record.verification_status, "created_at": record.created_at}


@router.get("")
def list_vault(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(ProtectedFile).filter(ProtectedFile.user_id == user.id).order_by(ProtectedFile.created_at.desc()).all()
    return {"success": True, "data": [serialize(record) for record in records]}


@router.get("/{file_id}")
def get_vault_file(file_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = user_file(db, user, file_id)
    if not record:
        raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": "Protected file not found."})
    return {"success": True, "data": serialize(record)}


@router.get("/{file_id}/download")
async def download_vault_file(file_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = user_file(db, user, file_id)
    if not record:
        raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": "Protected file not found."})
    await record_event(db, user, "FILE_DOWNLOADED", "SUCCESS", record.id, record.original_filename)
    return FileResponse(record.storage_path, media_type="application/octet-stream", filename=record.stored_filename)


@router.delete("/{file_id}")
async def delete_vault_file(file_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = user_file(db, user, file_id)
    if not record:
        raise HTTPException(status_code=404, detail={"code": "FILE_NOT_FOUND", "message": "Protected file not found."})
    from pathlib import Path
    Path(record.storage_path).unlink(missing_ok=True)
    await record_event(db, user, "FILE_DELETED", "SUCCESS", record.id, record.original_filename)
    db.delete(record)
    db.commit()
    return {"success": True, "data": {"id": file_id, "deleted": True}}
