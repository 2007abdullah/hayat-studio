from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, File, Header, HTTPException, Response, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.api.auth import create_client, set_session
from app.api.deps import (get_current_user, get_optional_user, order_for_user, order_for_user_or_token, require_admin)
from app.core.config import get_settings
from app.core.ratelimit import rate_limit
from app.core.security import create_token
from app.db.session import get_db
from app.models.models import (AdminNote, Message, Notification, Order, OrderFile, ProjectUpdate, Service, User)
from app.schemas import schemas as S
from app.services import email as mail
from app.services import storage

router = APIRouter(prefix="/api", tags=["orders"])

STAGES = ["Request Received", "Discussion", "Planning", "Development", "Testing", "Review", "Completed"]
STATUS_STAGE = {"New": 0, "Contacted": 0, "Discussion": 1, "Quote Sent": 2, "Payment Pending": 2,
                "In Progress": 3, "Review": 5, "Completed": 6, "Cancelled": 0}
MAGIC = {"pdf": [b"%PDF"], "png": [b"\x89PNG"], "jpg": [b"\xff\xd8\xff"], "jpeg": [b"\xff\xd8\xff"],
         "docx": [b"PK\x03\x04"], "zip": [b"PK\x03\x04", b"PK\x05\x06"]}


def present(order: Order, detail: bool = False, admin: bool = False):
    idx = STATUS_STAGE.get(order.status, 0)
    latest = order.updates[0].progress if order.updates and order.updates[0].progress is not None else None
    if order.status == "In Progress" and latest is not None and latest >= 80:
        idx = 4
    progress = 100 if order.status == "Completed" else (latest if latest is not None else round(idx / 6 * 100))
    base = {c.name: getattr(order, c.name) for c in Order.__table__.columns}
    base.update(progress=progress, stage="Cancelled" if order.status == "Cancelled" else STAGES[idx])
    if admin:
        return S.AdminOrderDetail.model_validate({**base, "files": order.files, "updates": order.updates, "notes": order.notes})
    if detail:
        return S.OrderDetail.model_validate({**base, "files": order.files, "updates": order.updates})
    return S.OrderOut.model_validate(base)


def next_order_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    count = db.scalar(select(func.count(Order.id)).where(Order.order_number.like(f"ORD-{year}-%"))) or 0
    return f"ORD-{year}-{count + 1:04d}"


@router.post("/orders", response_model=S.OrderCreated, status_code=201, dependencies=[Depends(rate_limit("order", 8, 3600))])
def create_order(data: S.OrderIn, response: Response, bg: BackgroundTasks, db: Session = Depends(get_db),
                 user: User | None = Depends(get_optional_user)):
    service = db.scalar(select(Service).where(Service.slug == data.service_slug, Service.is_active))
    if not service:
        raise HTTPException(422, "Please choose a valid service.")
    email = data.client_email.lower()
    if not user and data.password:
        if db.scalar(select(User).where(User.email == email)):
            raise HTTPException(409, "An account with this email exists. Please sign in first.")
        user = create_client(db, email, data.client_name, data.password, phone=data.client_phone,
                             company=data.company, country=data.country)
        set_session(response, user)
    order = None
    for attempt in range(3):  # retry on rare order-number race
        try:
            order = Order(order_number=next_order_number(db), user_id=user.id if user else None, service_id=service.id,
                          client_name=data.client_name, client_email=email, client_phone=data.client_phone,
                          company=data.company, country=data.country, service_title=service.title,
                          project_title=data.project_title, project_type=data.project_type, budget=data.budget,
                          deadline=data.deadline, requirements=data.requirements,
                          details=data.model_dump(include={"required_features", "existing_website", "existing_design", "has_domain",
                                                           "has_hosting", "needs_database", "needs_auth", "needs_admin", "needs_ai"}))
            db.add(order)
            db.add(Notification(for_admin=True, title=f"New order {order.order_number}", link="/admin/orders"))
            db.commit()
            break
        except Exception:
            db.rollback()
            if attempt == 2:
                raise
    s = get_settings()
    subj, html = mail.admin_new_order(order)
    bg.add_task(mail.send_email, s.admin_notify_email or s.admin_email, subj, html)
    subj, html = mail.client_confirmation(order)
    bg.add_task(mail.send_email, order.client_email, subj, html)
    return S.OrderCreated(order_number=order.order_number, id=order.id, service=order.service_title, status=order.status,
                          submitted_at=order.created_at, upload_token=create_token(str(order.id), "order-upload", minutes=60))


@router.get("/orders", response_model=list[S.OrderOut])
def list_orders(q: str | None = None, status: str | None = None, priority: str | None = None, sort: str = "newest",
                db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = select(Order)
    if user.role != "admin":
        stmt = stmt.where(Order.user_id == user.id)
    if status:
        stmt = stmt.where(Order.status == status)
    if priority:
        stmt = stmt.where(Order.priority == priority)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(func.lower(Order.order_number + " " + Order.client_name + " " + Order.client_email + " " + Order.project_title).like(like))
    stmt = stmt.order_by(Order.created_at.asc() if sort == "oldest" else Order.created_at.desc())
    return [present(o) for o in db.scalars(stmt).all()]


@router.get("/orders/{order_id}", response_model=None)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = order_for_user(order_id, db, user)
    return present(order, detail=True, admin=user.role == "admin").model_dump(mode="json")


@router.patch("/orders/{order_id}", response_model=S.OrderOut)
def patch_order(order_id: int, data: S.OrderPatch, bg: BackgroundTasks, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found.")
    prev_status, prev_quote = order.status, order.quoted_amount
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(order, k, v)
    if order.user_id and order.status != prev_status:
        db.add(Notification(user_id=order.user_id, title=f"{order.order_number} is now {order.status}", link=f"/dashboard/orders/{order.id}"))
    db.commit()
    if order.status != prev_status:
        subj, html = mail.quote_notification(order) if order.status == "Quote Sent" and order.quoted_amount else mail.status_update(order)
        bg.add_task(mail.send_email, order.client_email, subj, html)
    return present(order)


# ---- messages
@router.get("/orders/{order_id}/messages", response_model=list[S.MessageOut])
def get_messages(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = order_for_user(order_id, db, user)
    me = "admin" if user.role == "admin" else "client"
    changed = False
    for m in order.messages:
        if m.sender_role != me and not m.is_read:
            m.is_read, changed = True, True
    if changed:
        db.commit()
    return order.messages


@router.post("/orders/{order_id}/messages", response_model=S.MessageOut, status_code=201, dependencies=[Depends(rate_limit("msg", 30, 300))])
def post_message(order_id: int, data: S.MessageIn, bg: BackgroundTasks, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = order_for_user(order_id, db, user)
    role = "admin" if user.role == "admin" else "client"
    msg = Message(order_id=order.id, sender_id=user.id, sender_role=role, body=data.body.strip())
    db.add(msg)
    if role == "client":
        db.add(Notification(for_admin=True, title=f"Message on {order.order_number}", link=f"/admin/orders/{order.id}"))
    elif order.user_id:
        db.add(Notification(user_id=order.user_id, title=f"New message on {order.order_number}", link=f"/dashboard/orders/{order.id}"))
    db.commit()
    s = get_settings()
    subj, html = mail.new_message_notification(order, user.full_name, to_admin=role == "client")
    bg.add_task(mail.send_email, (s.admin_notify_email or s.admin_email) if role == "client" else order.client_email, subj, html)
    return msg


# ---- updates & notes (admin writes, client reads via order detail)
@router.post("/orders/{order_id}/updates", response_model=S.UpdateOut, status_code=201)
def add_update(order_id: int, data: S.UpdateIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found.")
    upd = ProjectUpdate(order_id=order.id, title=data.title, body=data.body, progress=data.progress)
    db.add(upd)
    if order.user_id:
        db.add(Notification(user_id=order.user_id, title=f"Project update: {data.title}", link=f"/dashboard/orders/{order.id}"))
    db.commit()
    return upd


@router.post("/orders/{order_id}/notes", response_model=S.NoteOut, status_code=201)
def add_note(order_id: int, data: S.NoteIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not db.get(Order, order_id):
        raise HTTPException(404, "Order not found.")
    note = AdminNote(order_id=order_id, body=data.body)
    db.add(note)
    db.commit()
    return note


# ---- files
@router.post("/orders/{order_id}/files", response_model=S.FileOut, status_code=201, dependencies=[Depends(rate_limit("upload", 40, 3600))])
async def upload_file(order_id: int, file: UploadFile = File(...), db: Session = Depends(get_db),
                      user: User | None = Depends(get_optional_user), x_upload_token: str | None = Header(default=None)):
    order, role = order_for_user_or_token(order_id, db, user, x_upload_token)
    s = get_settings()
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
    if ext not in S.ALLOWED_EXT:
        raise HTTPException(422, "Unsupported file type. Allowed: PDF, PNG, JPG, DOCX, ZIP.")
    data = await file.read(s.max_upload_mb * 1024 * 1024 + 1)
    if len(data) > s.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File is too large. Maximum size is {s.max_upload_mb} MB.")
    if not any(data.startswith(sig) for sig in MAGIC[ext]):
        raise HTTPException(422, "The file content does not match its extension.")
    backend, key = storage.save(data, file.filename, file.content_type or "application/octet-stream", f"orders/{order.order_number}")
    rec = OrderFile(order_id=order.id, uploaded_by_role=role, filename=(file.filename or "file")[:255],
                    content_type=file.content_type or "application/octet-stream", size=len(data), storage_key=key, backend=backend)
    db.add(rec)
    if role == "client":
        db.add(Notification(for_admin=True, title=f"File uploaded on {order.order_number}", link=f"/admin/orders/{order.id}"))
    db.commit()
    return rec


@router.get("/files/{file_id}")
def download_file(file_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rec = db.get(OrderFile, file_id)
    if not rec:
        raise HTTPException(404, "File not found.")
    order_for_user(rec.order_id, db, user)  # authorization
    url = storage.signed_url(rec.backend, rec.storage_key)
    if url:
        return RedirectResponse(url)
    data = storage.read_local(rec.storage_key)
    if data is None:
        raise HTTPException(404, "File not found.")
    safe = rec.filename.replace('"', "")
    return Response(data, media_type=rec.content_type, headers={"Content-Disposition": f'attachment; filename="{safe}"',
                                                                 "X-Content-Type-Options": "nosniff"})
