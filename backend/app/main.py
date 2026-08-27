import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.boms import router as boms_router
from app.routers.settings import router as settings_router
from app.routers.ecos import router as ecos_router
from app.routers.reports import router as reports_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Migrations are a release operation, not a web-process startup action.
    # Running them here causes races when a platform starts multiple workers.
    yield


app = FastAPI(
    title="Ecovia PLM",
    version="0.1.0",
    lifespan=lifespan,
)

# ==========================
# CORS Configuration
# ==========================
origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

# Allow localhost during development if no env variable exists
if not origins:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Routers
# ==========================
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(boms_router)
app.include_router(settings_router)
app.include_router(ecos_router)
app.include_router(reports_router)


@app.get("/")
async def root():
    return {"message": "Ecovia PLM Backend is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
