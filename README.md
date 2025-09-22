# Lost and Found Platform

## Setup Instructions

### 1. Clone and Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Configuration

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with actual values (get SendGrid key from team lead)
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Default values should work for local development
```

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
- Get SendGrid API key from team lead for email functionality
- Use AUB email addresses (@aub.edu.lb or @mail.aub.edu) for registration
