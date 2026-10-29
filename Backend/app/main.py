from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, activity, decryption, encryption, verification, vault
from app.core.config import get_settings
from app.database.database import Base, engine
from app.database import models  # noqa: F401

settings = get_settings()
Base.metadata.create_all(bind=engine)
app = FastAPI(title="CRYPTOVA API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["GET", "POST", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])

app.include_router(auth.router)
app.include_router(encryption.router)
app.include_router(verification.router)
app.include_router(decryption.router)
app.include_router(vault.router)
app.include_router(activity.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"success": True, "data": {"status": "ok", "service": "cryptova-api"}}
