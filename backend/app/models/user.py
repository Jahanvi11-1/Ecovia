from sqlalchemy import CheckConstraint, Column, DateTime, Integer, String, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    login_id = Column(String(12), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "role IN ('Admin', 'Engineering User', 'Approver', 'Operations User')",
            name="users_role_check",
        ),
    )
