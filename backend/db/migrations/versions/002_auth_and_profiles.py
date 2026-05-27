"""Add users and user_profiles tables

Revision ID: 002
Revises: 001
Create Date: 2026-05-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "user_profiles",
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column(
            "software_level",
            sa.Text(),
            sa.CheckConstraint(
                "software_level IN ('beginner', 'intermediate', 'advanced')",
                name="ck_user_profiles_software_level",
            ),
            nullable=False,
        ),
        sa.Column(
            "python_familiarity",
            sa.Text(),
            sa.CheckConstraint(
                "python_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
                name="ck_user_profiles_python_familiarity",
            ),
            nullable=False,
        ),
        sa.Column(
            "linux_familiarity",
            sa.Text(),
            sa.CheckConstraint(
                "linux_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
                name="ck_user_profiles_linux_familiarity",
            ),
            nullable=False,
        ),
        sa.Column(
            "hardware_background",
            sa.Text(),
            sa.CheckConstraint(
                "hardware_background IN ('none', 'basic', 'intermediate', 'advanced')",
                name="ck_user_profiles_hardware_background",
            ),
            nullable=False,
        ),
        sa.Column(
            "ai_ml_familiarity",
            sa.Text(),
            sa.CheckConstraint(
                "ai_ml_familiarity IN ('none', 'basic', 'intermediate', 'advanced')",
                name="ck_user_profiles_ai_ml_familiarity",
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("user_profiles")
    op.drop_table("users")
