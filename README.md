# Abdullah Hayat Studio: portfolio, order system and dashboards

A freelancer platform: public portfolio, service marketplace, order intake with file upload, client dashboard (progress, messages, files, updates) and admin dashboard (orders, clients, services, projects, content, analytics).

```
Next.js (Vercel)  ──/api proxy──►  FastAPI (Railway/Render/AWS)  ──►  PostgreSQL
                                         ├── Resend (email)
                                         └── Storage: local (dev) | S3 / Cloudflare R2 | Cloudinary
```

## Stack
Frontend: Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Lenis, Recharts, Sonner, Lucide.
Backend: FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PostgreSQL, PyJWT, bcrypt.
Ops: Docker, docker-compose, GitHub Actions.

## Quick start (Docker)
```bash
cp backend/.env.example backend/.env
# edit backend/.env: set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build
```
Open http://localhost:3000 · API docs http://localhost:8000/docs.
On start the backend runs migrations, then `python -m app.seed`, which creates the first admin (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, only if no admin exists) and starter services/projects.

## Local development (without Docker)
```bash
# database
docker run -d --name hs-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hayat_studio -p 5432:5432 postgres:16-alpine

# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # edit values
alembic upgrade head && python -m app.seed
uvicorn app.main:app --reload   # http://localhost:8000

# frontend (new terminal)
cd frontend && cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
```

## Creating the first admin securely
Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` as environment variables for the first deploy, run the seed (the Docker image does it on start), sign in at `/login`, then **remove `ADMIN_PASSWORD` from the environment**. Nothing is hardcoded. Public registration only ever creates `client` accounts.

## Tests
```bash
cd backend && pytest -q          # auth, orders, authorization, uploads, messaging, contact, admin
cd frontend && npm test && npx tsc --noEmit && npm run lint
```

## Environment variables
See `backend/.env.example` and `frontend/.env.example`. Never commit real values.
Key ones: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`, `COOKIE_SECURE=true` in production, `RESEND_API_KEY`, `EMAIL_FROM`, `STORAGE_BACKEND` (+ S3/R2 or Cloudinary credentials), `ADMIN_EMAIL`, `ADMIN_NOTIFY_EMAIL`.

## Deployment
**Database:** create a managed PostgreSQL (Railway, Neon, RDS). Copy its URL as `DATABASE_URL` using the `postgresql+psycopg2://` scheme.

**Backend (Railway):** New project → deploy from GitHub → set root directory `backend` (it uses the Dockerfile). Set env vars: `APP_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (long random), `FRONTEND_URL=https://your-domain`, `CORS_ORIGINS=https://your-domain`, `COOKIE_SECURE=true`, `RESEND_API_KEY`, `EMAIL_FROM` (a verified domain), storage credentials (`STORAGE_BACKEND=s3` or `cloudinary`, **not** `local`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (first deploy only), `ADMIN_NOTIFY_EMAIL`. The container runs `alembic upgrade head` on start.

**Frontend (Vercel):** import the repo, root directory `frontend`. Set `BACKEND_URL=https://your-backend.up.railway.app`, `NEXT_PUBLIC_SITE_URL=https://your-domain`, plus the social/email variables. The Next.js `/api/*` rewrite proxies to the backend, so session cookies are first-party and no cross-site cookie setup is needed.

**Custom domain & SSL:** add the domain in Vercel (and optionally `api.your-domain` on Railway); both issue SSL automatically. Update `FRONTEND_URL` and `CORS_ORIGINS` to the final domain.

**Email:** verify your sending domain in Resend and use an address on it in `EMAIL_FROM`.

**CI/CD:** `.github/workflows/ci.yml` lints, tests, builds and builds Docker images on every push/PR; the deploy job runs only on `main` after everything passes and only when you set repository variables `RAILWAY_ENABLED` / `VERCEL_ENABLED` to `true` and add the matching secrets (`RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). Alternatively use Railway/Vercel's own GitHub auto-deploys.

## Things to personalise before launch
- Replace `frontend/public/img/portrait.svg` with your photo; set social links and email in `frontend/.env`.
- The seeded projects, case studies, testimonials and About statistics are **sample/demo content**. Edit them in the admin dashboard (Projects, Content). No real clients or metrics are claimed.
- Pricing packages live in `frontend/sections/Pricing.tsx`.
- Service/project artwork is generated locally (`npm run gen:images`) so there are no external image dependencies; upload real screenshots from the admin dashboard.

## Security notes
bcrypt hashing; JWT in HTTP-only cookies (or Bearer); role checks on every protected route (clients get 404 for other people's orders); input validation via Pydantic; parameterised SQL via SQLAlchemy; upload allow-list + size limit + content signature check; in-memory rate limits (swap for Redis if you run several instances); security headers; docs disabled in production.

## API
Interactive docs at `/docs` in development. Main routes: `/api/auth/*`, `/api/services`, `/api/projects`, `/api/orders` (+ `/messages`, `/files`, `/updates`, `/notes`), `/api/contact`, `/api/admin/*`.
