# Ecovia PLM

A full-stack Product Lifecycle Management system built with FastAPI and React. The core principle is **immutability by default** — no active product or Bill of Materials data can be edited directly. All changes are proposed through Engineering Change Orders (ECOs), routed through a configurable multi-stage approval pipeline, and atomically applied when approved.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+), SQLAlchemy 2.0 async |
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Database | PostgreSQL 15+ |
| Auth | JWT (python-jose) + bcrypt |
| Testing (BE) | pytest + Hypothesis (property-based) |
| Testing (FE) | Vitest + React Testing Library |

---

## Project Structure

```
ecovia/
├── backend/
│   ├── app/
│   │   ├── core/          # security, deps, stage machine, version manager, diff engine
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # FastAPI route handlers
│   │   └── schemas/       # Pydantic request/response models
│   ├── alembic/           # Database migrations
│   ├── tests/             # Property-based tests (Hypothesis)
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/           # Axios client with JWT interceptor
    │   ├── components/    # React components (auth, eco, products, bom, layout, etc.)
    │   └── store/         # Zustand stores (auth, ui, eco)
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+ running locally (or any accessible instance)

---

## Setup

### 1. Create the database

Connect to PostgreSQL and create an empty database:

```sql
CREATE DATABASE ecovia;
```

That's all the manual SQL you need. Tables are created automatically on first startup.

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ecovia
SECRET_KEY=your-secret-key-change-in-production
```

Start the server:

```bash
uvicorn app.main:app --reload
```

On first launch, Alembic runs `upgrade head` automatically and creates all tables. No manual migration step needed.

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Roles

| Role | Permissions |
|---|---|
| Admin | Full access — all endpoints, settings, reports |
| Engineering User | Create and edit ECOs |
| Approver | Approve, apply, and reject ECOs; view reports |
| Operations User | Read-only access |

---

## Key Features

**ECO Workflow** — All product and BoM changes go through an Engineering Change Order. ECOs move through configurable stages (configured in Settings), each optionally requiring approval. Once an ECO reaches the final stage and is validated, it can be applied.

**Version Control** — When an ECO is applied with the version toggle enabled, the current active product version is archived and a new version is created. With the toggle off, changes are patched onto the existing version without incrementing the version number.

**Diff View** — Each ECO shows a side-by-side comparison of current vs. proposed data. Added/increased fields are highlighted green; removed/decreased fields are highlighted red.

**Audit Trail** — Every action on an ECO (approve, validate, apply, reject) writes an immutable log entry. Full audit history is available in the Reports section.

**RBAC** — All endpoints are protected by role-based access control enforced via JWT claims.

---

## API Overview

| Router | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Signup, login, forgot password, current user |
| Products | `/api/products` | Read-only product and version data |
| BoMs | `/api/boms` | Read-only Bill of Materials data |
| ECOs | `/api/ecos` | Full ECO lifecycle (create, approve, validate, apply, reject, diff) |
| Settings | `/api/settings` | ECO stage configuration (Admin only) |
| Reports | `/api/reports` | Audit logs and version history |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://user:pass@localhost:5432/ecovia` |
| `SECRET_KEY` | JWT signing secret | Any long random string |
