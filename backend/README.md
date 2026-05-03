# stp-scheduler (backend)

FastAPI service with PostgreSQL for instructors, students, sections, and enrollments. The scheduler still uses in-memory domain objects; they are **hydrated from the database** on startup and after each successful CSV import.

## Prerequisites

- Python 3.12+
- PostgreSQL 16+ (or use Docker Compose from the repo root)

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLAlchemy URL, e.g. `postgresql://postgres:postgres@localhost:5432/stp-scheduler` |
| `AUTH_SECRET` | JWT signing secret (≥32 chars). If unset, auth is disabled (local only). |
| `AUTH_USERNAME` / `AUTH_PASSWORD` | Login credentials when auth is enabled |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional; default `480` |

## Setup

```bash
cd backend
pip install -r requirements.txt
```

Create the database (name must match `DATABASE_URL`), then apply migrations:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stp-scheduler
alembic upgrade head
```

Reference data (`time_blocks`) is seeded by the initial migration. **Roster data is not read from disk on startup.** Upload CSVs to populate students and instructors.

**Schedule:** The scheduler does **not** run on startup. `GET /sections` is empty until you call **`POST /schedule/regenerate`** (or until the database already contains sections from a previous run). After regenerate and other mutations that change enrollments or sections, **`sections` and `student_sections`** in Postgres are updated to match in-memory state.

## Run (development)

```bash
fastapi dev app.py
```

API: http://localhost:8000

## Run (production-style)

```bash
fastapi run app.py --host 0.0.0.0 --port 8000
```

## CSV uploads (authenticated)

After logging in (`POST /auth/login`), use multipart uploads (Bearer JWT):

- `POST /import/students` — body field `file`: students CSV (see `data/students.csv` for column names).
- `POST /import/instructors` — body field `file`: instructors CSV with columns **Teacher**, **Class**, **Weight** (see `data/instructors.csv`).

Each import **replaces all rows** for that entity, clears persisted **sections** / **student_sections**, then reloads domain state from the database. Re-run **regenerate** to build a new schedule after roster changes.

## Docker

From `backend/`:

```bash
docker build -t stp-scheduler .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://user:pass@host:5432/dbname stp-scheduler
```

From the repository root, Compose brings up Postgres, backend, and frontend; backend receives `DATABASE_URL` automatically. Wait for Postgres to be healthy before the API accepts traffic.

## Layout

Application code lives under `stp_scheduler/` (`api`, `db`, `domain`, `services`, `loaders`). `app.py` at the backend root re-exports the FastAPI app for `fastapi run app.py`.
