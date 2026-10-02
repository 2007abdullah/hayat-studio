from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Status = Literal["New", "Contacted", "Discussion", "Quote Sent", "Payment Pending",
                 "In Progress", "Review", "Completed", "Cancelled"]
Priority = Literal["Low", "Medium", "High", "Urgent"]


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---- auth
class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    country: str | None = Field(default=None, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class UserOut(ORM):
    id: int
    email: str
    full_name: str
    role: str
    phone: str | None = None
    company: str | None = None
    country: str | None = None
    created_at: datetime


# ---- catalogue
class ServiceIn(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9-]+$", max_length=120)
    title: str = Field(max_length=160)
    icon: str = "code"
    description: str
    features: list[str] = []
    starting_price: int = Field(ge=0)
    delivery_estimate: str = ""
    image_url: str = ""
    is_active: bool = True
    sort_order: int = 0


class ServiceOut(ServiceIn, ORM):
    id: int


class ProjectIn(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9-]+$", max_length=120)
    title: str = Field(max_length=160)
    category: str = ""
    summary: str = ""
    image_url: str = ""
    technologies: list[str] = []
    features: list[str] = []
    gallery: list[str] = []
    case_study: dict = {}
    live_url: str | None = None
    github_url: str | None = None
    is_featured: bool = False
    is_published: bool = True
    sort_order: int = 0


class ProjectOut(ProjectIn, ORM):
    id: int


class TestimonialIn(BaseModel):
    name: str
    company: str = ""
    role: str = ""
    avatar_url: str = ""
    quote: str
    is_demo: bool = True
    is_published: bool = True


class TestimonialOut(TestimonialIn, ORM):
    id: int


# ---- orders
ALLOWED_EXT = {"pdf", "png", "jpg", "jpeg", "docx", "zip"}


class OrderIn(BaseModel):
    client_name: str = Field(min_length=2, max_length=160)
    client_email: EmailStr
    client_phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    country: str | None = Field(default=None, max_length=80)
    service_slug: str
    project_title: str = Field(min_length=3, max_length=200)
    project_type: str | None = Field(default=None, max_length=80)
    budget: str | None = Field(default=None, max_length=80)
    deadline: str | None = Field(default=None, max_length=80)
    requirements: str = Field(min_length=20, max_length=8000)
    required_features: str | None = Field(default=None, max_length=2000)
    existing_website: str | None = Field(default=None, max_length=300)
    existing_design: bool = False
    has_domain: bool = False
    has_hosting: bool = False
    needs_database: bool = False
    needs_auth: bool = False
    needs_admin: bool = False
    needs_ai: bool = False
    password: str | None = Field(default=None, min_length=8, max_length=128)  # optional: create account


class FileOut(ORM):
    id: int
    filename: str
    content_type: str
    size: int
    uploaded_by_role: str
    created_at: datetime


class MessageOut(ORM):
    id: int
    sender_role: str
    body: str
    is_read: bool
    created_at: datetime
    attachments: list[FileOut] = []


class UpdateOut(ORM):
    id: int
    title: str
    body: str
    progress: int | None
    created_at: datetime


class NoteOut(ORM):
    id: int
    body: str
    created_at: datetime


class OrderOut(ORM):
    id: int
    order_number: str
    client_name: str
    client_email: str
    client_phone: str | None
    company: str | None
    country: str | None
    service_title: str
    project_title: str
    project_type: str | None
    budget: str | None
    deadline: str | None
    requirements: str
    details: dict
    status: str
    priority: str
    quoted_amount: int | None
    created_at: datetime
    updated_at: datetime
    progress: int = 0
    stage: str = "Request Received"


class OrderDetail(OrderOut):
    files: list[FileOut] = []
    updates: list[UpdateOut] = []


class AdminOrderDetail(OrderDetail):
    notes: list[NoteOut] = []


class OrderCreated(BaseModel):
    order_number: str
    id: int
    service: str
    status: str
    submitted_at: datetime
    upload_token: str


class OrderPatch(BaseModel):
    status: Status | None = None
    priority: Priority | None = None
    quoted_amount: int | None = Field(default=None, ge=0)


class MessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class UpdateIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    body: str = Field(min_length=2, max_length=5000)
    progress: int | None = Field(default=None, ge=0, le=100)


class NoteIn(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    website: str = ""  # honeypot, must stay empty

    @field_validator("website")
    @classmethod
    def honeypot(cls, v):
        if v:
            raise ValueError("invalid")
        return v


class StatsIn(BaseModel):
    items: list[dict]
