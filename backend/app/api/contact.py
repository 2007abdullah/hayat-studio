from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.ratelimit import rate_limit
from app.db.session import get_db
from app.models.models import ContactMessage, Notification
from app.schemas.schemas import ContactIn
from app.services import email as mail

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", status_code=201, dependencies=[Depends(rate_limit("contact", 5, 600))])
def contact(data: ContactIn, bg: BackgroundTasks, db: Session = Depends(get_db)):
    c = ContactMessage(name=data.name, email=data.email, subject=data.subject, message=data.message)
    db.add(c)
    db.add(Notification(for_admin=True, title=f"Contact: {data.subject}", link="/admin/contact"))
    db.commit()
    s = get_settings()
    subject, html = mail.contact_notification(c)
    bg.add_task(mail.send_email, s.admin_notify_email or s.admin_email, subject, html)
    return {"detail": "Thanks - your message has been sent. I'll reply soon."}
