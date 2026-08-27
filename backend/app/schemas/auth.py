from pydantic import BaseModel, EmailStr, field_validator


VALID_ROLES = {"Admin", "Engineering User", "Approver", "Operations User"}


class SignupRequest(BaseModel):
    login_id: str
    email: EmailStr
    password: str
    # Public registration never grants privileges.  Administrators assign
    # elevated roles through an authenticated administration workflow.
    role: str = "Engineering User"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        special_chars = set(r"""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~""")
        if not any(c in special_chars for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v != "Engineering User":
            raise ValueError("Public signup creates Engineering User accounts only")
        return v


class SignupResponse(BaseModel):
    user_id: int
    login_id: str
    email: str
    role: str


class LoginRequest(BaseModel):
    login_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):
    user_id: int
    login_id: str
    email: str
    role: str
