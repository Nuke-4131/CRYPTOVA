import base64
import os
from pathlib import Path
from uuid import uuid4
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import get_settings

MAGIC = b"CRYPTOVA"
VERSION = 1
NONCE_SIZE = 12


def _master_key() -> bytes:
    value = get_settings().master_key_b64
    if not value:
        raise RuntimeError("CRYPTOVA_MASTER_KEY_B64 is not configured")
    key = base64.b64decode(value)
    if len(key) != 32:
        raise RuntimeError("CRYPTOVA_MASTER_KEY_B64 must decode to 32 bytes")
    return key


def _wrap_key(data_key: bytes) -> tuple[str, str]:
    nonce = os.urandom(NONCE_SIZE)
    wrapped = AESGCM(_master_key()).encrypt(nonce, data_key, b"CRYPTOVA-DEK-v1")
    return base64.b64encode(wrapped).decode(), base64.b64encode(nonce).decode()


def _unwrap_key(wrapped_key: str, nonce: str) -> bytes:
    return AESGCM(_master_key()).decrypt(base64.b64decode(nonce), base64.b64decode(wrapped_key), b"CRYPTOVA-DEK-v1")


def encrypt_bytes(contents: bytes, original_name: str, mime_type: str) -> tuple[bytes, str, str]:
    data_key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(NONCE_SIZE)
    associated_data = f"{VERSION}:AES-256-GCM:{mime_type}".encode()
    ciphertext = AESGCM(data_key).encrypt(nonce, contents, associated_data)
    package = MAGIC + bytes([VERSION]) + nonce + ciphertext
    wrapped_key, key_nonce = _wrap_key(data_key)
    return package, wrapped_key, key_nonce


def decrypt_bytes(package: bytes, wrapped_key: str, key_nonce: str, mime_type: str) -> bytes:
    if len(package) < len(MAGIC) + 1 + NONCE_SIZE + 16 or package[:len(MAGIC)] != MAGIC:
        raise ValueError("Invalid CRYPTOVA package format")
    version = package[len(MAGIC)]
    if version != VERSION:
        raise ValueError("Unsupported CRYPTOVA package version")
    offset = len(MAGIC) + 1
    nonce = package[offset:offset + NONCE_SIZE]
    ciphertext = package[offset + NONCE_SIZE:]
    associated_data = f"{version}:AES-256-GCM:{mime_type}".encode()
    return AESGCM(_unwrap_key(wrapped_key, key_nonce)).decrypt(nonce, ciphertext, associated_data)


def write_package(package: bytes) -> tuple[str, str]:
    settings = get_settings()
    stored_name = f"{uuid4()}.crypt"
    path = settings.storage_path / stored_name
    path.write_bytes(package)
    return stored_name, str(path)


def read_package(storage_path: str) -> bytes:
    path = Path(storage_path).resolve()
    root = get_settings().storage_path.resolve()
    if root not in path.parents:
        raise ValueError("Storage path escaped the configured storage directory")
    return path.read_bytes()
