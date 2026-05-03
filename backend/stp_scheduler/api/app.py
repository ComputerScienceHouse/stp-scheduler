import os
from contextlib import asynccontextmanager
from pathlib import Path
from alembic import command
from alembic.config import Config
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, RootModel
from sqlalchemy import delete
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import JSONResponse

from stp_scheduler import auth
from stp_scheduler.api import state
from stp_scheduler.db.base import SessionLocal, get_db
from stp_scheduler.db.models import InstructorRow, StudentRow
from stp_scheduler.domain.bucket import create_buckets
from stp_scheduler.domain.instructor import Instructor, delete_instructor
from stp_scheduler.domain.scheduler import run_scheduler
from stp_scheduler.domain.section import Section, export_sections_to_csv
from stp_scheduler.domain.student import Student, delete_student
from stp_scheduler.schemas.api import InstructorRequest, StudentRequest
from stp_scheduler.services.csv_import import (
    import_instructors_replace_all,
    import_students_replace_all,
)
from stp_scheduler.services.db_bootstrap import ensure_time_blocks
from stp_scheduler.services.hydrate import hydrate_from_database
from stp_scheduler.services.schedule_persist import persist_schedule

_MAX_CSV_BYTES = 5 * 1024 * 1024


def _run_alembic_upgrade() -> None:
    backend_root = Path(__file__).resolve().parent.parent.parent
    ini = backend_root / "alembic.ini"
    if not ini.exists():
        return
    cfg = Config(str(ini))
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    auth.init_auth(auth.load_auth_settings_from_env())

    try:
        _run_alembic_upgrade()
    except Exception as e:
        print(f"[Startup] Database migration skipped or failed: {e}")

    db = SessionLocal()
    try:
        ensure_time_blocks(db)
        hydrate_from_database(db)
    except Exception as e:
        print(f"[Startup] Database hydrate skipped: {e}")
    finally:
        db.close()

    app.state.conflicts = []

    print(
        f"[Startup] Loaded {len(state.students)} students, "
        f"{len(state.instructors)} instructors, "
        f"{len(state.sections)} sections from database (hydrated only; no scheduler run)"
    )

    yield


app = FastAPI(title="Class Scheduler API", lifespan=lifespan)

origins = ["http://localhost:3000"]
_frontend_urls = os.environ.get("FRONTEND_URLS", "").strip()
if _frontend_urls:
    for _frontend_url in _frontend_urls.split(","):
        _u = _frontend_url.strip()
        if _u and _u not in origins:
            origins.append(_u)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Access-Control-Allow-Origin"],
)


@app.middleware("http")
async def protect_docs_when_authenticated(request: Request, call_next):
    if auth.get_auth_settings() is None:
        return await call_next(request)
    path = request.url.path
    if path not in ("/docs", "/redoc", "/openapi.json"):
        return await call_next(request)
    if auth.authorization_header_valid(request.headers.get("Authorization")):
        return await call_next(request)
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Not authenticated"},
    )


class CSV(RootModel[list[dict]]):
    pass


class LoginBody(BaseModel):
    username: str
    password: str


protected_router = APIRouter(dependencies=[Depends(auth.require_auth)])


@app.get("/")
def health_root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/auth/status")
def auth_status():
    return {"auth_required": auth.get_auth_settings() is not None}


@app.post("/auth/login")
def login(body: LoginBody):
    settings = auth.get_auth_settings()
    if settings is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Authentication is not configured",
        )
    if not auth.verify_login(body.username, body.password, settings):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = auth.issue_access_token(settings)
    return {"access_token": token, "token_type": "bearer"}


def _require_csv(upload: UploadFile) -> None:
    fn = (upload.filename or "").lower()
    if not fn.endswith(".csv"):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="A .csv file is required."
        )


@protected_router.post("/import/students")
def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _require_csv(file)
    raw = file.file.read()
    if len(raw) > _MAX_CSV_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
    try:
        n = import_students_replace_all(db, raw)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    hydrate_from_database(db)
    app.state.conflicts = []
    return {"imported": n, "message": "Students replaced from CSV"}


@protected_router.post("/import/instructors")
def import_instructors_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _require_csv(file)
    raw = file.file.read()
    if len(raw) > _MAX_CSV_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
    try:
        n = import_instructors_replace_all(db, raw)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    hydrate_from_database(db)
    app.state.conflicts = []
    return {"imported": n, "message": "Instructors replaced from CSV"}


@protected_router.get("/students")
def get_students():
    return [s.to_json() for s in state.students.values()]


@protected_router.get("/instructors")
def get_instructors():
    return [i.to_json() for i in state.instructors.values()]


@protected_router.get("/sections")
def get_sections():
    return [s.to_json() for s in state.sections.values()]


@protected_router.get("/buckets")
def get_buckets():
    buckets, _ = create_buckets()
    for b in buckets:
        b.assign_students(list(state.students.values()))
    return [
        {
            "name": str(b),
            "subject": b.subject,
            "level": b.level,
            "size": b.get_size(),
            "sectionsNeeded": b.get_sections_needed(),
            "studentIds": [str(s.id) for s in b.get_students()],
        }
        for b in buckets
    ]


@protected_router.get("/schedule")
def schedule():
    conflicts = app.state.conflicts
    return {
        "sections": [s.to_json() for s in state.sections.values()],
        "conflicts": conflicts,
    }


@protected_router.post("/schedule/regenerate")
def regenerate_schedule(db: Session = Depends(get_db)):
    conflicts = run_scheduler()
    app.state.conflicts = conflicts
    persist_schedule(db)
    db.commit()
    return {
        "sections": [s.to_json() for s in state.sections.values()],
        "conflicts": conflicts,
    }


@protected_router.post("/export")
def export():
    # TODO: send the export to the frontend instead of writing to a file
    export_sections_to_csv(list(state.sections.values()), "final_sections.csv")
    return {"status": "exported"}


@protected_router.delete("/students/delete")
def delete_student_api(student_id: str, db: Session = Depends(get_db)):
    s = state.students.pop(student_id)
    delete_student(s)
    db.execute(delete(StudentRow).where(StudentRow.id == student_id))
    persist_schedule(db)
    db.commit()
    return {"message": f"Student {student_id} deleted"}


@protected_router.delete("/instructors/delete")
def delete_instructor_api(instructor_id: str, db: Session = Depends(get_db)):
    inst = state.instructors.pop(instructor_id)
    delete_instructor(inst)
    persist_schedule(db)
    db.execute(delete(InstructorRow).where(InstructorRow.id == instructor_id))
    db.commit()
    return {"message": f"Instructor {instructor_id} deleted"}


@protected_router.post("/instructors/create")
def add_instructor(body: InstructorRequest, db: Session = Depends(get_db)):
    inst = Instructor(
        body.subject_weights,
        body.sections if body.sections is not None else 3,
        body.name,
        body.is_mentor,
    )
    state.instructors[str(inst.id)] = inst
    db.add(
        InstructorRow(
            id=str(inst.id),
            name=inst.name,
            max_sections=inst.sections,
            is_mentor=inst.is_mentor,
            subject_weights=dict(inst.subjects),
        )
    )
    db.commit()
    return {"message": "Instructor added", "instructor": body}


@protected_router.post("/students/create")
def add_student(body: StudentRequest, db: Session = Depends(get_db)):
    s = Student(body.name, **body.subject_abilities)
    state.students[str(s.id)] = s
    if body.section_ids is not None:
        for section_id in body.section_ids:
            sec = state.sections.get(section_id)
            if sec:
                sec.add_student(s)
                s.add_section(sec)
    db.add(
        StudentRow(
            id=str(s.id),
            name=s.name,
            subject_abilities=dict(s.subject_rankings),
        )
    )
    db.flush()
    persist_schedule(db)
    db.commit()
    return {"message": "Student added", "student": body}


@protected_router.put("/instructors/update")
def update_instructor(body: InstructorRequest, db: Session = Depends(get_db)):
    inst = state.instructors.get(body.id)
    if inst is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Instructor not found")
    inst.set_name(body.name)
    inst.set_subjects(body.subject_weights)
    inst.set_mentor(body.is_mentor)
    if body.sections is not None:
        inst.set_sections(body.sections)
    row = db.get(InstructorRow, body.id)
    if row:
        row.name = inst.name
        row.max_sections = inst.sections
        row.is_mentor = inst.is_mentor
        row.subject_weights = dict(inst.subjects)
        db.commit()
    return {"message": "Instructor updated", "instructor": body}


@protected_router.put("/students/update")
def update_student(body: StudentRequest, db: Session = Depends(get_db)):
    s = state.students.get(body.id)
    if s is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Student not found")
    s.set_name(body.name)
    s.set_subject_rankings(**body.subject_abilities)
    if body.section_ids is not None:
        for sec in list(s.get_schedule()):
            sec.remove_student(s)
            s.remove_section(sec)
        for section_id in body.section_ids:
            sec = state.sections.get(section_id)
            if sec:
                sec.add_student(s)
                s.add_section(sec)
    row = db.get(StudentRow, body.id)
    if row:
        row.name = s.name
        row.subject_abilities = dict(s.subject_rankings)
    persist_schedule(db)
    db.commit()
    return {"message": "Student updated", "student": body}


@protected_router.post("/update/csv")
def update_csv(csv: CSV):
    return {"message": "CSV uploaded", "csv": csv}


app.include_router(protected_router)
