from app.services.crypto_service import decrypt_bytes


def verify_package(package: bytes, wrapped_key: str, key_nonce: str, mime_type: str) -> tuple[bool, str]:
    try:
        decrypt_bytes(package, wrapped_key, key_nonce, mime_type)
        return True, "Package format, authentication, and integrity checks passed."
    except ValueError as exc:
        return False, str(exc)
