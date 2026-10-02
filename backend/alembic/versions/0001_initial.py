"""initial schema

Revision ID: 0001
Revises:
"""
from alembic import op
from app.db.session import Base
import app.models.models  # noqa: F401

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Baseline: creates every table from the current models.
    # For later changes run:  alembic revision --autogenerate -m "describe change"
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
