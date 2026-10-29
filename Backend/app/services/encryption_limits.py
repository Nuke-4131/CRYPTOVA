import re

MAX_FILE_SIZE = 100 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".zip", ".json", ".docx", ".xlsx", ".txt", ".jpg", ".jpeg", ".png"}


def validate_filename(filename: str) -> str:
    safe = filename.replace("\\", "/").split("/")[-1]
    safe = re.sub(r"[^A-Za-z0-9._ -]", "_", safe).replace("..", ".")[:180]
    if not safe or "." not in safe or "." + safe.rsplit(".", 1)[-1].lower() not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type")
    return safe
