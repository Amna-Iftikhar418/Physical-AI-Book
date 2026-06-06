import uuid

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import create_access_token, hash_password, verify_password, verify_token
from db.connection import get_db
from db.models import User, UserProfile

router = APIRouter(prefix="/api", tags=["auth"])

_VALID_LEVELS = {"none", "basic", "intermediate", "advanced"}
_VALID_SW_LEVELS = {"beginner", "intermediate", "advanced"}


class SignupRequest(BaseModel):
    email: str
    password: str
    software_level: str
    python_familiarity: str
    linux_familiarity: str
    hardware_background: str
    ai_ml_familiarity: str


class SigninRequest(BaseModel):
    email: str
    password: str


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


async def _bearer_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[7:]
    try:
        return verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/auth/signup")
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    if body.software_level not in _VALID_SW_LEVELS:
        raise HTTPException(status_code=422, detail=f"software_level must be one of {_VALID_SW_LEVELS}")
    for field, val in [
        ("python_familiarity", body.python_familiarity),
        ("linux_familiarity", body.linux_familiarity),
        ("hardware_background", body.hardware_background),
        ("ai_ml_familiarity", body.ai_ml_familiarity),
    ]:
        if val not in _VALID_LEVELS:
            raise HTTPException(status_code=422, detail=f"{field} must be one of {_VALID_LEVELS}")

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.flush()

    profile = UserProfile(
        user_id=user.id,
        software_level=body.software_level,
        python_familiarity=body.python_familiarity,
        linux_familiarity=body.linux_familiarity,
        hardware_background=body.hardware_background,
        ai_ml_familiarity=body.ai_ml_familiarity,
    )
    db.add(profile)
    await db.commit()

    return {"user_id": str(user.id), "token": create_access_token(str(user.id))}


@router.post("/auth/signin")
async def signin(body: SigninRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"user_id": str(user.id), "token": create_access_token(str(user.id))}


@router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that email")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}


@router.get("/auth/session")
async def get_session(
    user_id: str = Depends(_bearer_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"user_id": str(user.id), "email": user.email}


@router.get("/user/profile")
async def get_user_profile(
    user_id: str = Depends(_bearer_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()

    return {
        "user_id": str(user.id),
        "email": user.email,
        "profile": {
            "software_level": profile.software_level if profile else None,
            "python_familiarity": profile.python_familiarity if profile else None,
            "linux_familiarity": profile.linux_familiarity if profile else None,
            "hardware_background": profile.hardware_background if profile else None,
            "ai_ml_familiarity": profile.ai_ml_familiarity if profile else None,
        },
    }
