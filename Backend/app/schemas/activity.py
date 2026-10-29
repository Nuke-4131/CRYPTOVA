from datetime import datetime
from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: str
    action: str
    resource_id: str | None
    resource_name: str | None
    status: str
    details: str | None
    created_at: datetime
