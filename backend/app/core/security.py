from datetime import datetime, timedelta, timezone


from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext


_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"
DEFAULT_EXPIRE_MINUTES = 60




def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password*."""
    return _pwd_context.hash(password)




def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches the bcrypt *hashed* value."""
    return _pwd_context.verify(plain, hashed)




def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a signed JWT containing *data* with an expiry claim."""
    secret_key = os.getenv("SECRET_KEY", "changeme")
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta is not None else timedelta(minutes=DEFAULT_EXPIRE_MINUTES)
    )
    payload["exp"] = expire
    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)




def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT.  Raises HTTP 401 on any failure."""
    secret_key = os.getenv("SECRET_KEY", "changeme")
    try:
        return jwt.decode(token, secret_key, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
