from typing import Any
from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: bool = True
    data: Any


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorBody
