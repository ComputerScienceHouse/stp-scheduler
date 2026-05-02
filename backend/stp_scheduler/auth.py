"""JWT bearer authentication when AUTH_SECRET is set."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

AUTH_SETTINGS: Optional["AuthSettings"] = None

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthSettings:
    secret: str
    username: str
    password_hash: bytes
    token_expire_minutes: int


def load_auth_settings_from_env() -> Optional[AuthSettings]:
    secret = os.environ.get("AUTH_SECRET", "").strip()
    if not secret:
        return None
    if len(secret) < 32:
        raise ValueError(
            "AUTH_SECRET must be at least 32 characters when enabling authentication."
        )
    username = os.environ.get("AUTH_USERNAME", "").strip()
    password = os.environ.get("AUTH_PASSWORD", "").strip()
    if not username or not password:
        raise ValueError(
            "AUTH_USERNAME and AUTH_PASSWORD are required when AUTH_SECRET is set."
        )
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        raise ValueError("AUTH_PASSWORD must be at most 72 bytes (bcrypt limit).")
    password_hash = bcrypt.hashpw(pw_bytes, bcrypt.gensalt(rounds=12))
    expire_raw = os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "480").strip()
    try:
        token_expire_minutes = int(expire_raw)
    except ValueError as e:
        raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be an integer.") from e
    if token_expire_minutes < 1 or token_expire_minutes > 60 * 24 * 14:
        raise ValueError(
            "ACCESS_TOKEN_EXPIRE_MINUTES must be between 1 and 20160 (14 days)."
        )
    return AuthSettings(
        secret=secret,
        username=username,
        password_hash=password_hash,
        token_expire_minutes=token_expire_minutes,
    )


def init_auth(settings: Optional[AuthSettings]) -> None:
    global AUTH_SETTINGS
    AUTH_SETTINGS = settings


def get_auth_settings() -> Optional[AuthSettings]:
    return AUTH_SETTINGS


def issue_access_token(settings: AuthSettings) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.token_expire_minutes)
    payload = {"sub": settings.username, "exp": exp, "typ": "access"}
    return jwt.encode(payload, settings.secret, algorithm="HS256")


def verify_login(username: str, password: str, settings: AuthSettings) -> bool:
    if username != settings.username:
        return False
    return bcrypt.checkpw(password.encode("utf-8"), settings.password_hash)


def _decode_access_token(token: str, settings: AuthSettings) -> dict:
    payload = jwt.decode(
        token,
        settings.secret,
        algorithms=["HS256"],
        options={"require": ["exp", "sub"]},
    )
    sub = payload.get("sub")
    if sub != settings.username:
        raise InvalidTokenError()
    return payload


def authorization_header_valid(authorization: Optional[str]) -> bool:
    settings = get_auth_settings()
    if settings is None:
        return True
    if not authorization:
        return False
    parts = authorization.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return False
    try:
        _decode_access_token(parts[1].strip(), settings)
    except InvalidTokenError:
        return False
    return True


def require_auth(
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials],
        Depends(_bearer),
    ],
) -> None:
    settings = get_auth_settings()
    if settings is None:
        return
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        _decode_access_token(credentials.credentials, settings)
    except InvalidTokenError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
