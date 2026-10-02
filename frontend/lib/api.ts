export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function parse(res: Response) {
  if (res.status === 204) return null;
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

/** Browser API client. Calls /api/* which Next proxies to FastAPI (same-origin cookies). */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      credentials: "include",
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
  const data = await parse(res);
  if (!res.ok) {
    const msg = typeof data?.detail === "string" ? data.detail : "Something went wrong. Please try again.";
    throw new ApiError(msg, res.status, data?.fields ?? {});
  }
  return data as T;
}

/** Server-component fetch. Returns null instead of throwing so pages degrade to empty states. */
export async function serverApi<T>(path: string, revalidate = 60): Promise<T | null> {
  const base = process.env.BACKEND_URL || (process.env.NODE_ENV === "production"
    ? "https://hayat-studio-production.up.railway.app"
    : "http://localhost:8000");
  try {
    const res = await fetch(`${base}/api${path}`, { next: { revalidate } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Multipart upload with progress (fetch has no upload progress events). */
export function uploadFile(path: string, file: File, onProgress: (pct: number) => void, headers: Record<string, string> = {}): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api${path}`);
    xhr.withCredentials = true;
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new ApiError("Upload failed. Check your connection and try again.", 0));
    xhr.onload = () => {
      let data: any = null;
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(typeof data?.detail === "string" ? data.detail : "Upload failed.", xhr.status));
    };
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
export const fmtTime = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  github: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
};
