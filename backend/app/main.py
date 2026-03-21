import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.boms import router as boms_router
from app.routers.settings import router as settings_router
from app.routers.ecos import router as ecos_router
from app.routers.reports import router as reports_router

# Resolve the backend/ directory (parent of app/)
BACKEND_DIR = Path(__file__).resolve().parent.parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run alembic upgrade head on startup to ensure all tables exist
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
        cwd=str(BACKEND_DIR),
    )
    if result.returncode != 0:
        print(f"Alembic migration failed:\n{result.stderr}", file=sys.stderr)
        raise RuntimeError("Database migration failed on startup")
    if result.stdout:
        print(result.stdout)
    yield


app = FastAPI(title="Ecovia PLM", version="0.1.0", lifespan=lifespan)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(boms_router)
app.include_router(settings_router)
app.include_router(ecos_router)
app.include_router(reports_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
