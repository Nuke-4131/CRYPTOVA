from sqlalchemy.orm import Session
from app.database.models import ActivityLog, User


async def record_event(db: Session, user: User, action: str, status: str, resource_id: str | None = None, resource_name: str | None = None, details: str | None = None) -> ActivityLog:
    """Backend audit boundary; production can forward events to an append-only audit system."""
    event = ActivityLog(user_id=user.id, action=action, status=status, resource_id=resource_id, resource_name=resource_name, details=details)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
