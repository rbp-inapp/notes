from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Union
import os

# =========================
# JWT CONFIG
# =========================

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# =========================
# PASSWORD HASHING CONFIG
# =========================
# IMPORTANT:
# - bcrypt_sha256 pre-hashes with SHA-256
# - avoids bcrypt 72-byte limit
# - Unicode-safe
# - OWASP recommended

pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)

# =========================
# PASSWORD FUNCTIONS
# =========================

def get_password_hash(password: str) -> str:
    """
    Hash a password safely.
    Supports long & Unicode passwords.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    """
    return pwd_context.verify(plain_password, hashed_password)

# =========================
# JWT TOKEN FUNCTIONS
# =========================

def create_access_token(
    data: dict,
    expires_delta: Union[timedelta, None] = None
) -> str:
    """
    Create a JWT access token.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return encoded_jwt
