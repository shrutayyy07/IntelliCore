# IntelliCore — Smart File Analytics

A full-stack document intelligence platform. Upload PDFs and images, extract metadata, detect blur, score confidence using Fuzzy Logic, and view real-time processing logs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts, Lucide React |
| Backend | Spring Boot 3.2, Java 17 |
| Metadata | Apache PDFBox, Apache Tika |
| Vision | Python 3 + OpenCV (via ProcessBuilder) |
| AI/ML | Fuzzy Logic Confidence Scoring |
| Auth | JWT + OTP (phone-based) |
| Storage | JSON flat-file (no database needed) |
| Batch | Java ThreadPoolExecutor |
| Logging | SLF4J structured logging |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
intellicore/
├── frontend/          # React app → deploy to Vercel
│   ├── src/
│   │   ├── pages/         # Dashboard, Upload, Documents, Batch, Logs
│   │   ├── components/    # Sidebar
│   │   ├── contexts/      # Auth, Theme (dark/light)
│   │   └── lib/api.js     # Axios API client
│   └── vercel.json
│
└── backend/           # Spring Boot app → deploy to Railway
    ├── src/main/java/com/intellicore/
    │   ├── controller/    # REST controllers
    │   ├── service/       # Business logic
    │   ├── model/         # Document, User, LogEntry
    │   ├── security/      # JWT auth filter
    │   └── storage/       # Flat-file JSON persistence
    ├── src/main/python/   # blur_detection.py
    ├── Dockerfile
    └── railway.json
```

---

## Quick Start (Local Dev)

### Backend
```bash
cd backend
# Set env vars (or use defaults)
export JWT_SECRET=your-secret-key
export STORAGE_PATH=./data
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:8080
npm install
npm start
# Runs on http://localhost:3000
```

---

## Deployment

### Backend → Railway
1. Push `backend/` to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects the `Dockerfile`
4. Set these environment variables in Railway dashboard:
   ```
   JWT_SECRET=<a long random string>
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   STORAGE_PATH=/app/data
   ```
5. Railway gives you a URL like `https://intellicore-backend.railway.app`

### Frontend → Vercel
1. Push `frontend/` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
3. Set environment variables in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://intellicore-backend.railway.app
   ```
4. Deploy → Vercel gives you `https://intellicore.vercel.app`

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT token |

### Documents
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/documents` | ✅ | List all documents |
| POST | `/api/documents/upload` | ✅ | Upload a file |
| DELETE | `/api/documents/{id}` | ✅ | Delete a document |
| GET | `/api/documents/stats` | ✅ | Dashboard stats |
| GET | `/api/documents/{id}/full` | ADMIN | Full document JSON |

### Batch & Logs
| Method | Path | Description |
|---|---|---|
| POST | `/api/batch/process` | Start batch processing |
| GET | `/api/batch/progress` | Get batch progress |
| GET | `/api/logs` | Get system logs |
| DELETE | `/api/logs` | Clear logs |

---

## OTP Authentication Flow

1. User enters phone number → `POST /api/auth/send-otp`
2. Backend generates a 6-digit OTP (logged in dev mode)
3. User enters OTP → `POST /api/auth/verify-otp`
4. Backend returns a JWT token
5. Frontend stores JWT in `localStorage` and attaches to all requests

> **Production**: Integrate [Twilio](https://twilio.com) or [MSG91](https://msg91.com) in `AuthService.java` to actually send SMS. Remove `otp` from the API response.

---

## Intern Project Alignment (8-Week Plan)

| Week | Task | Implemented |
|---|---|---|
| 1 | Spring Boot Scaffolding + Flat-File Storage | ✅ |
| 2 | PDF/Image Metadata + Python Vision | ✅ |
| 3 | ProcessBuilder Interop + Fuzzy Logic AI | ✅ |
| 4 | Spring Batch Processing + JWT Auth | ✅ |
| 5 | React Frontend Bridge (real-time logs) | ✅ |
| 6 | Validation Engine (score < 70 → REJECTED) | ✅ |
| 7 | SLF4J Structured Logging (Vision Requests) | ✅ |
| 8 | Dockerfile (multi-stage Java + Python) | ✅ |

---

## Environment Variables Reference

### Backend
| Variable | Default | Description |
|---|---|---|
| `PORT` | 8080 | Server port |
| `JWT_SECRET` | (required) | JWT signing key |
| `STORAGE_PATH` | `./data` | JSON + uploads directory |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |
| `PYTHON_EXECUTABLE` | `python3` | Python binary path |
| `PYTHON_SCRIPT_PATH` | `./src/main/python/blur_detection.py` | Blur detection script |

### Frontend
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend URL (no trailing slash) |
