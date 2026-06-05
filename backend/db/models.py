import uuid
from pgvector.sqlalchemy import Vector
from sqlalchemy import BigInteger, Column, Integer, String, Text, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from db.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    software_level = Column(
        Text,
        CheckConstraint(
            "software_level IN ('beginner', 'intermediate', 'advanced')",
            name="ck_user_profiles_software_level",
        ),
        nullable=False,
    )
    python_familiarity = Column(
        Text,
        CheckConstraint(
            "python_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
            name="ck_user_profiles_python_familiarity",
        ),
        nullable=False,
    )
    linux_familiarity = Column(
        Text,
        CheckConstraint(
            "linux_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
            name="ck_user_profiles_linux_familiarity",
        ),
        nullable=False,
    )
    hardware_background = Column(
        Text,
        CheckConstraint(
            "hardware_background IN ('none', 'basic', 'intermediate', 'advanced')",
            name="ck_user_profiles_hardware_background",
        ),
        nullable=False,
    )
    ai_ml_familiarity = Column(
        Text,
        CheckConstraint(
            "ai_ml_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
            name="ck_user_profiles_ai_ml_familiarity",
        ),
        nullable=False,
    )
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


class ChapterChunk(Base):
    __tablename__ = "chapter_chunks"

    id = Column(BigInteger, primary_key=True)
    chapter_id = Column(Text, nullable=False, index=True)
    module_id = Column(Text, nullable=False)
    heading = Column(Text)
    text = Column(Text, nullable=False)
    char_start = Column(Integer, nullable=False)
    embedding = Column(Vector(3072))


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    chapter_id = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role = Column(
        String(16),
        CheckConstraint("role IN ('user', 'assistant')", name="ck_messages_role"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
