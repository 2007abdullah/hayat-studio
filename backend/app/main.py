import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import admin, auth, catalog, contact, orders
from app.core.config import get_settings

log = logging.getLogger("app")
settings = get_settings()
prod = settings.app_env == "production"

app = FastAPI(title="Abdullah Hayat Studio API", version="1.0.0",
              docs_url=None if prod else "/docs", redoc_url=None if prod else "/redoc",
              openapi_url=None if prod else "/openapi.json")

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_credentials=True,
                   allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Content-Type", "Authorization", "X-Upload-Token"])


@app.middleware("http")
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("X-Frame-Options", "DENY")
    resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return resp


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    fields = {".".join(str(p) for p in e["loc"][1:]): e["msg"] for e in exc.errors()}
    return JSONResponse(status_code=422, content={"detail": "Please check the highlighted fields.", "fields": fields})


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on our side. Please try again."})


@app.get("/api/health")
def health():
    return {"status": "ok"}


for r in (auth.router, catalog.router, contact.router, orders.router, admin.router, admin.media_router):
    app.include_router(r)
