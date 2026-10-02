from datetime import datetime, timezone
from sqlalchemy import (JSON, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)


ORDER_STATUSES = ["New", "Contacted", "Discussion", "Quote Sent", "Payment Pending",
                  "In Progress", "Review", "Completed", "Cancelled"]
PRIORITIES = ["Low", "Medium", "High", "Urgent"]


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="client")  # client | admin
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Service(Base, TimestampMixin):
    __tablename__ = "services"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    icon: Mapped[str] = mapped_column(String(40), default="code")
    description: Mapped[str] = mapped_column(Text)
    features: Mapped[list] = mapped_column(JSON, default=list)
    starting_price: Mapped[int] = mapped_column(Integer, default=0)  # USD
    delivery_estimate: Mapped[str] = mapped_column(String(80), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Project(Base, TimestampMixin):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(80), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    technologies: Mapped[list] = mapped_column(JSON, default=list)
    features: Mapped[list] = mapped_column(JSON, default=list)
    gallery: Mapped[list] = mapped_column(JSON, default=list)
    # case study: overview, problem, solution, architecture, process, challenges, results, deployment
    case_study: Mapped[dict] = mapped_column(JSON, default=dict)
    live_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    client_name: Mapped[str] = mapped_column(String(160))
    client_email: Mapped[str] = mapped_column(String(255), index=True)
    client_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    service_title: Mapped[str] = mapped_column(String(160))
    project_title: Mapped[str] = mapped_column(String(200))
    project_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    budget: Mapped[str | None] = mapped_column(String(80), nullable=True)
    deadline: Mapped[str | None] = mapped_column(String(80), nullable=True)
    requirements: Mapped[str] = mapped_column(Text)
    details: Mapped[dict] = mapped_column(JSON, default=dict)  # features, existing site, toggles
    status: Mapped[str] = mapped_column(String(30), default="New", index=True)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")
    quoted_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)  # USD, admin-set
    user: Mapped[User | None] = relationship(back_populates="orders")
    service: Mapped[Service | None] = relationship()
    files: Mapped[list["OrderFile"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    messages: Mapped[list["Message"]] = relationship(back_populates="order", cascade="all, delete-orphan",
                                                     order_by="Message.created_at")
    updates: Mapped[list["ProjectUpdate"]] = relationship(back_populates="order", cascade="all, delete-orphan",
                                                          order_by="ProjectUpdate.created_at.desc()")
    notes: Mapped[list["AdminNote"]] = relationship(back_populates="order", cascade="all, delete-orphan",
                                                    order_by="AdminNote.created_at.desc()")


class OrderFile(Base):
    __tablename__ = "order_files"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    uploaded_by_role: Mapped[str] = mapped_column(String(20), default="client")
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(120))
    size: Mapped[int] = mapped_column(Integer)
    storage_key: Mapped[str] = mapped_column(String(500))
    backend: Mapped[str] = mapped_column(String(20), default="local")
    message_id: Mapped[int | None] = mapped_column(ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    order: Mapped[Order] = relationship(back_populates="files")


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_role: Mapped[str] = mapped_column(String(20))
    body: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    order: Mapped[Order] = relationship(back_populates="messages")
    attachments: Mapped[list[OrderFile]] = relationship(foreign_keys="OrderFile.message_id")
    __table_args__ = (Index("ix_messages_order_created", "order_id", "created_at"),)


class ProjectUpdate(Base):
    __tablename__ = "project_updates"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    progress: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0-100
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    order: Mapped[Order] = relationship(back_populates="updates")


class AdminNote(Base):
    __tablename__ = "admin_notes"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    order: Mapped[Order] = relationship(back_populates="notes")


class Testimonial(Base, TimestampMixin):
    __tablename__ = "testimonials"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str] = mapped_column(String(160), default="")
    role: Mapped[str] = mapped_column(String(120), default="")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    quote: Mapped[str] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    is_handled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    for_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    title: Mapped[str] = mapped_column(String(200))
    link: Mapped[str | None] = mapped_column(String(300), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class SiteSetting(Base):
    """Editable key/value content (e.g. about-page statistics)."""
    __tablename__ = "site_settings"
    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON, default=dict)
