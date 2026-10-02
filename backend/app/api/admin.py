from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.api.deps import require_admin
from app.core.config import get_settings
from app.db.session import get_db
from app.models.models import (ContactMessage, Notification, Order, Project, Service, SiteSetting, Testimonial, User)
from app.schemas import schemas as S
from app.services import storage

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])
media_router = APIRouter(prefix="/api", tags=["media"])

ACTIVE = ["Contacted", "Discussion", "Quote Sent", "Payment Pending", "In Progress", "Review"]


@router.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(Order.id))) or 0
    by_status = dict(db.execute(select(Order.status, func.count(Order.id)).group_by(Order.status)).all())
    by_service = [{"service": k, "count": v} for k, v in
                  db.execute(select(Order.service_title, func.count(Order.id)).group_by(Order.service_title)).all()]
    since = datetime.now(timezone.utc) - timedelta(days=180)
    per_month: dict[str, int] = {}
    for (created,) in db.execute(select(Order.created_at).where(Order.created_at >= since)).all():
        per_month[created.strftime("%Y-%m")] = per_month.get(created.strftime("%Y-%m"), 0) + 1
    clients = db.scalar(select(func.count(User.id)).where(User.role == "client")) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Order.quoted_amount), 0)).where(Order.status.in_(["In Progress", "Review", "Completed"]))) or 0
    pending_contacts = db.scalar(select(func.count(ContactMessage.id)).where(ContactMessage.is_handled.is_(False))) or 0
    completed = by_status.get("Completed", 0)
    return {
        "total_orders": total, "new_orders": by_status.get("New", 0),
        "active_projects": sum(by_status.get(s, 0) for s in ["In Progress", "Review"]),
        "in_pipeline": sum(by_status.get(s, 0) for s in ACTIVE),
        "completed_projects": completed, "total_clients": clients,
        "revenue_estimate": int(revenue), "pending_inquiries": pending_contacts,
        "conversion_rate": round(completed / total * 100) if total else 0,
        "orders_by_status": by_status, "orders_by_service": by_service,
        "orders_over_time": [{"month": k, "count": v} for k, v in sorted(per_month.items())],
    }


@router.get("/clients")
def clients(db: Session = Depends(get_db)):
    users = db.scalars(select(User).where(User.role == "client").order_by(User.created_at.desc())).all()
    counts = dict(db.execute(select(Order.user_id, func.count(Order.id)).group_by(Order.user_id)).all())
    return [{**S.UserOut.model_validate(u).model_dump(mode="json"), "orders": counts.get(u.id, 0)} for u in users]


@router.get("/contact-messages")
def contact_messages(db: Session = Depends(get_db)):
    rows = db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc())).all()
    return [{"id": r.id, "name": r.name, "email": r.email, "subject": r.subject, "message": r.message,
             "is_handled": r.is_handled, "created_at": r.created_at.isoformat()} for r in rows]


@router.patch("/contact-messages/{cid}", status_code=204)
def handle_contact(cid: int, db: Session = Depends(get_db)):
    row = db.get(ContactMessage, cid)
    if not row:
        raise HTTPException(404, "Message not found.")
    row.is_handled = True
    db.commit()


@router.get("/notifications")
def notifications(db: Session = Depends(get_db)):
    rows = db.scalars(select(Notification).where(Notification.for_admin).order_by(Notification.created_at.desc()).limit(30)).all()
    return [{"id": n.id, "title": n.title, "link": n.link, "is_read": n.is_read, "created_at": n.created_at.isoformat()} for n in rows]


@router.post("/notifications/read", status_code=204)
def read_notifications(db: Session = Depends(get_db)):
    for n in db.scalars(select(Notification).where(Notification.for_admin, Notification.is_read.is_(False))):
        n.is_read = True
    db.commit()


# ---- generic CRUD for services / projects / testimonials
def _crud(path: str, Model, In, Out):
    @router.get(f"/{path}", response_model=list[Out])
    def list_all(db: Session = Depends(get_db)):
        return db.scalars(select(Model).order_by(Model.id)).all()

    @router.post(f"/{path}", response_model=Out, status_code=201)
    def create(data: In, db: Session = Depends(get_db)):
        if hasattr(Model, "slug") and db.scalar(select(Model).where(Model.slug == data.slug)):
            raise HTTPException(409, "That slug is already in use.")
        row = Model(**data.model_dump())
        db.add(row)
        db.commit()
        return row

    @router.put(f"/{path}/{{rid}}", response_model=Out)
    def update(rid: int, data: In, db: Session = Depends(get_db)):
        row = db.get(Model, rid)
        if not row:
            raise HTTPException(404, "Not found.")
        for k, v in data.model_dump().items():
            setattr(row, k, v)
        db.commit()
        return row

    @router.delete(f"/{path}/{{rid}}", status_code=204)
    def delete(rid: int, db: Session = Depends(get_db)):
        row = db.get(Model, rid)
        if not row:
            raise HTTPException(404, "Not found.")
        db.delete(row)
        db.commit()


_crud("services", Service, S.ServiceIn, S.ServiceOut)
_crud("projects", Project, S.ProjectIn, S.ProjectOut)
_crud("testimonials", Testimonial, S.TestimonialIn, S.TestimonialOut)


@router.put("/stats")
def set_stats(data: S.StatsIn, db: Session = Depends(get_db)):
    row = db.get(SiteSetting, "about_stats") or SiteSetting(key="about_stats", value={})
    row.value = {"items": data.items}
    db.add(row)
    db.commit()
    return row.value


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    s = get_settings()
    data = await file.read(s.max_upload_mb * 1024 * 1024 + 1)
    kind = "image/png" if data.startswith(b"\x89PNG") else "image/jpeg" if data.startswith(b"\xff\xd8\xff") else \
        "image/webp" if data[8:12] == b"WEBP" else None
    if not kind or len(data) > s.max_upload_mb * 1024 * 1024:
        raise HTTPException(422, "Upload a PNG, JPG or WebP image under the size limit.")
    return {"url": storage.public_save(data, file.filename or "image", kind, "site")}


@media_router.get("/media/{key:path}")
def media(key: str):
    """Serves admin-uploaded public images when STORAGE_BACKEND=local (dev). Order files are never served here."""
    if not key.startswith("site/"):
        raise HTTPException(404, "Not found.")
    data = storage.read_local(key)
    if data is None:
        raise HTTPException(404, "Not found.")
    ctype = "image/png" if data.startswith(b"\x89PNG") else "image/webp" if data[8:12] == b"WEBP" else "image/jpeg"
    return Response(data, media_type=ctype, headers={"Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff"})
