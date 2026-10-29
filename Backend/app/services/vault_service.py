from sqlalchemy.orm import Session
from app.database.models import ProtectedFile, User


def user_file(db: Session, user: User, file_id: str) -> ProtectedFile | None:
    return db.query(ProtectedFile).filter(ProtectedFile.id == file_id, ProtectedFile.user_id == user.id).first()
