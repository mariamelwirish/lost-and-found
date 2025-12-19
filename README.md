# AUB Lost & Found Platform

An end-to-end web platform for the American University of Beirut community to report, discover, and resolve lost and found items. Students, faculty, and staff can post items (lost or found) with photos, search and filter results, and mark items as received. Admins can moderate and perform bulk actions.

If you are looking for step-by-step setup and environment configuration, see Instructions.md.

## Features
- Post items as "Lost" or "Found" with title, description, date, location, and images.
- Search and filter by keyword, location, exact date, date range, and status.
- Personal views for "My Lost" and "My Found" items.
- Mark an item as received or revoke that status (owner or admin).
- AUB email-based sign-up and verification; JWT authentication with refresh.
- Admin endpoints for bulk operations and moderation.
- Optional Supabase-backed image storage; local storage fallback.
- Health check endpoint and Sentry instrumentation (frontend + backend).

## Tech Stack
- Frontend: React 19, React Router 7, Vite, Axios, Vitest, Testing Library.
- Backend: Django 5.2, Django REST Framework, SimpleJWT, CORS, WhiteNoise, Pillow.
- Storage: Supabase (via django-storages) or local filesystem.
- Database: PostgreSQL (docker-compose provided) or SQLite for local tests.
- Monitoring: Sentry SDK wired on both frontend and backend.

## Architecture Overview
- frontend/: Vite app with pages (Lost, Found, Create/Edit Post, Profile), layouts, and shared components.
	- src/api.js: Axios client with JWT bearer and refresh interceptor.
	- Env vars used: VITE_API_URL (Axios base), VITE_API_BASE (fetch base).
- backend/: Django project with two apps:
	- users: custom user model, AUB email verification and password reset flows.
	- api: item posts, images, admin operations, and Sentry test endpoint.
- docker-compose.yml: local PostgreSQL service with a named volume.

### Backend URLs (non-exhaustive)
- Health: GET /health/
- Auth:
	- POST /api/user/register/
	- POST /api/token/
	- POST /api/token/refresh/
- Users (email flows):
	- POST /api/users/send-code/
	- POST /api/users/verify-code/
	- POST /api/users/request-password-reset/
	- POST /api/users/reset-password/
	- GET /api/users/profile/
- Posts: /api/posts/ (list, retrieve, create, update, delete)
	- Filters: kind=lost|found, mine=1, q, location, date, date_from, date_to, ordering (e.g. -creationDate)
	- Actions (auth required): POST /api/posts/{id}/mark_received/, POST /api/posts/{id}/revoke_received/
- Admin: /api/admin/... (including POST /api/admin/posts/bulk/)
- Debug: GET /debug/sentry-test/ (raises error for Sentry), /debug/send-test-email/

## Quick Start (Local)

### Prerequisites
- Python 3.11+ (recommended)
- Node.js 20+
- Git
- Optional: Docker Desktop (for local PostgreSQL)

### 1) Start PostgreSQL (optional but recommended)
If you prefer PostgreSQL locally:

```bash
docker compose up -d db
```

Database URL to use in the backend `.env` (replace placeholders with your credentials):

```
postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME
```

For quick tests you can also use SQLite with `DATABASE_URL=sqlite:///db.sqlite3`.

### 2) Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
```

Create backend `.env` (see the full example below) and run migrations:

```bash
python manage.py migrate
python manage.py runserver
```

### 3) Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Default dev URLs: Frontend http://localhost:5173, Backend http://localhost:8000

## Environment Variables

### Backend (.env)
- DJANGO_DEBUG=true
- DJANGO_SECRET_KEY=dev-insecure
- DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME
- CORS_ALLOWED_ORIGINS=http://localhost:5173
- EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
- SENTRY_DSN=<your-sentry-dsn> (optional)
- SENTRY_TRACES_SAMPLE_RATE=0.2 (optional)
- SENTRY_ENVIRONMENT=development (optional)
- USE_SUPABASE=true|false
- SUPABASE_URL=<your-supabase-url>
- SUPABASE_KEY=<your-supabase-service-key>
- SUPABASE_BUCKET_NAME=item-images

Notes:
- With `USE_SUPABASE=true`, images are saved to the Supabase bucket `item-images`.
- With `USE_SUPABASE=false`, images are stored locally under media/.

### Frontend (.env)
- VITE_API_URL=http://localhost:8000
- VITE_API_BASE=http://localhost:8000
- VITE_SENTRY_DSN=<your-sentry-dsn> (optional)
- VITE_SENTRY_TRACES_SAMPLE_RATE=0.2 (optional)
- VITE_SENTRY_REPLAY_SAMPLE_RATE=0 (optional)
- VITE_ENVIRONMENT=development (optional)

## Testing

### Backend
```bash
cd backend
set DATABASE_URL=sqlite:///db.sqlite3
python manage.py test
```

### Frontend
```bash
cd frontend
npm test -- --run
```

## Monitoring (Sentry)
- Backend smoke test: http://localhost:8000/debug/sentry-test/
- Frontend smoke test: open http://localhost:5173/?sentryTest=1 once after `npm run dev`.

## Deployment Notes
- Backend can be deployed to Render or similar PaaS. Ensure environment variables (including Sentry) are set.
- Frontend can be deployed to Vercel. Set the same Sentry and API environment variables.

## License
This project is provided for educational use; no explicit license is specified.

