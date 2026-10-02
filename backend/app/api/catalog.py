from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Project, Service, SiteSetting, Testimonial
from app.schemas.schemas import ProjectOut, ServiceOut, TestimonialOut

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/services", response_model=list[ServiceOut])
def services(db: Session = Depends(get_db)):
    return db.scalars(select(Service).where(Service.is_active).order_by(Service.sort_order, Service.id)).all()


@router.get("/services/{slug}", response_model=ServiceOut)
def service(slug: str, db: Session = Depends(get_db)):
    s = db.scalar(select(Service).where(Service.slug == slug, Service.is_active))
    if not s:
        raise HTTPException(404, "Service not found.")
    return s


@router.get("/projects", response_model=list[ProjectOut])
def projects(featured: bool | None = None, db: Session = Depends(get_db)):
    q = select(Project).where(Project.is_published).order_by(Project.sort_order, Project.id)
    if featured is not None:
        q = q.where(Project.is_featured == featured)
    return db.scalars(q).all()


@router.get("/projects/{slug}", response_model=ProjectOut)
def project(slug: str, db: Session = Depends(get_db)):
    p = db.scalar(select(Project).where(Project.slug == slug, Project.is_published))
    if not p:
        raise HTTPException(404, "Project not found.")
    return p


@router.get("/testimonials", response_model=list[TestimonialOut])
def testimonials(db: Session = Depends(get_db)):
    return db.scalars(select(Testimonial).where(Testimonial.is_published).order_by(Testimonial.id)).all()


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    row = db.get(SiteSetting, "about_stats")
    return row.value if row else {"items": []}
