# Lost and Found Platform

## Setup Instructions

### 1. Clone and Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# includes sentry-sdk[django], structlog, Pillow, etc.
```

**Frontend:**
```bash
cd frontend
npm install
# installs @sentry/react alongside React 19/Vite deps
```

### 2. Environment Configuration

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with actual values (SendGrid key, database URL, Sentry DSN, etc.)
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Default values should work for local development (update VITE_SENTRY_* if you rotate your DSN)
```

### 2.5. Monitoring (Sentry)
- The sample `.env` files already include the provided DSN
	(`https://f8a347a339ca450ebc565a7da9a9096e@o4510383110815744.ingest.de.sentry.io/4510383131918416`).
- Override `SENTRY_DSN`/`VITE_SENTRY_DSN` per environment and adjust the
	optional `*_TRACES_SAMPLE_RATE`, `SENTRY_ENVIRONMENT`, and release tags as needed.
- After launching the app, trigger an error (e.g., temporarily raise an
	exception in a Django view) to verify events hit the Sentry dashboard.
- Deployments must set the same env vars in Render (backend) and Vercel (frontend) before smoke-testing.

#### 2.5.1. Verifying Sentry locally
- **Backend**: with `python manage.py runserver` running, browse to `http://localhost:8000/debug/sentry-test/`. That view raises `RuntimeError("Manual Sentry verification endpoint hit")`, which should appear in Sentry tagged with `environment: development`.
- **Frontend**: start Vite (`npm run dev`) and open `http://localhost:5173/?sentryTest=1`. `Home.jsx` watches for the `sentryTest` query param and throws once, generating a JavaScript event. Remove the query param to stop crashing.

#### 2.5.2. Verifying Sentry after deployment
- **Backend (Render)**: add `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_ENVIRONMENT=production`, and optional `SENTRY_RELEASE` to the Render service, redeploy, then visit `https://<your-render-domain>/debug/sentry-test/`. Resolve/ignore the resulting production-tagged issue when finished.
- **Frontend (Vercel)**: set `VITE_SENTRY_DSN`, `VITE_SENTRY_TRACES_SAMPLE_RATE`, `VITE_SENTRY_REPLAY_SAMPLE_RATE`, `VITE_ENVIRONMENT=production`, `VITE_SENTRY_RELEASE` in Vercel → Deployments → Environment Variables, redeploy, then hit `https://<your-vercel-domain>/?sentryTest=1`. The error should show up tagged with the production environment; remove the query string once confirmed.

### 3. Database Setup
```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Important Notes
- Never commit `.env` files to git
- Use SendGrid API key for email functionality
- Use AUB email addresses (@aub.edu.lb or @mail.aub.edu) for registration

