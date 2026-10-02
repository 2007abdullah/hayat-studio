"""Storage abstraction: local (dev only), S3 / Cloudflare R2, Cloudinary."""
import os
import re
import uuid
from pathlib import Path
from app.core.config import get_settings


def _safe(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]", "_", os.path.basename(name))[:120] or "file"


def save(data: bytes, filename: str, content_type: str, folder: str) -> tuple[str, str]:
    """Returns (backend, key)."""
    s = get_settings()
    key = f"{folder}/{uuid.uuid4().hex}-{_safe(filename)}"
    if s.storage_backend == "s3":
        _s3().put_object(Bucket=s.s3_bucket, Key=key, Body=data, ContentType=content_type)
    elif s.storage_backend == "cloudinary":
        import cloudinary.uploader
        res = cloudinary.uploader.upload(data, public_id=key, resource_type="raw" if not content_type.startswith("image/") else "image",
                                         type="authenticated")
        key = res["public_id"] + "|" + res["resource_type"]
    else:
        path = Path(s.local_upload_dir) / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return s.storage_backend, key


def public_save(data: bytes, filename: str, content_type: str, folder: str) -> str:
    """For admin-managed public images (service/project covers). Returns a URL."""
    s = get_settings()
    if s.storage_backend == "cloudinary":
        import cloudinary.uploader
        return cloudinary.uploader.upload(data, folder=folder)["secure_url"]
    backend, key = save(data, filename, content_type, folder)
    if backend == "s3":
        base = s.s3_endpoint_url.rstrip("/") if s.s3_endpoint_url else f"https://{s.s3_bucket}.s3.amazonaws.com"
        return f"{base}/{s.s3_bucket}/{key}" if s.s3_endpoint_url else f"{base}/{key}"
    return f"/api/media/{key}"


def read_local(key: str) -> bytes | None:
    base = Path(get_settings().local_upload_dir).resolve()
    path = (base / key).resolve()
    if base not in path.parents or not path.is_file():  # block path traversal
        return None
    return path.read_bytes()


def signed_url(backend: str, key: str) -> str | None:
    s = get_settings()
    if backend == "s3":
        return _s3().generate_presigned_url("get_object", Params={"Bucket": s.s3_bucket, "Key": key}, ExpiresIn=300)
    if backend == "cloudinary":
        import cloudinary.utils
        public_id, rtype = key.split("|")
        return cloudinary.utils.private_download_url(public_id, "", resource_type=rtype, type="authenticated")
    return None


def _s3():
    import boto3
    s = get_settings()
    return boto3.client("s3", region_name=s.s3_region, endpoint_url=s.s3_endpoint_url or None,
                        aws_access_key_id=s.s3_access_key_id, aws_secret_access_key=s.s3_secret_access_key)
