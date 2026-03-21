from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, SignupResponse, LoginRequest, TokenResponse, UserResponse, ForgotPasswordRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user


router = APIRouter(prefix="/api/auth", tags=["auth"])




@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Validate login_id length (6–12)
    if not (6 <= len(payload.login_id) <= 12):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Login ID must be between 6 and 12 characters",
        )


    # Check login_id uniqueness
    result = await db.execute(select(User).where(User.login_id == payload.login_id))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login ID already exists",
        )


    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )


    # Create user
    new_user = User(
        login_id=payload.login_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)


    return SignupResponse(
        user_id=new_user.user_id,
        login_id=new_user.login_id,
        email=new_user.email,
        role=new_user.role,
    )




@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.login_id == payload.login_id))
    user = result.scalar_one_or_none()


    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login Id or Password",
        )


    token = create_access_token({
        "sub": str(user.user_id),
        "role": user.role,
        "login_id": user.login_id,
    })
    return TokenResponse(access_token=token)




@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user.user_id,
        login_id=current_user.login_id,
        email=current_user.email,
        role=current_user.role,
    )




@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Stub: in production this would send a reset email
    # We always return success to avoid leaking whether an email exists
    return {"message": "If that email is registered, a password reset link has been sent."}
