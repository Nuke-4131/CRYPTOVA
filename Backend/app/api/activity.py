from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.database import get_db
from app.database.models import ActivityLog, User

router = APIRouter(prefix="/api/activity", tags=["activity"])


@router.get("")
def list_activity(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ActivityLog).filter(ActivityLog.user_id == user.id).order_by(ActivityLog.created_at.desc())
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    return {"success": True, "data": [{"id": row.id, "action": row.action, "resource_id": row.resource_id, "resource_name": row.resource_name, "status": row.status, "details": row.details, "created_at": row.created_at} for row in rows]}
