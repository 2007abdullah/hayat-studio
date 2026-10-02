import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request

_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(name: str, limit: int, per_seconds: int):
    """In-memory sliding-window limiter. Use a Redis-backed limiter when running many instances."""

    def dep(request: Request):
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "?").split(",")[0].strip()
        key = f"{name}:{ip}"
        now = time.time()
        q = _hits[key]
        while q and q[0] < now - per_seconds:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(429, "Too many requests. Please wait a moment and try again.")
        q.append(now)

    return dep
