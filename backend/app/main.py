from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.notes import router as notes_router
from app.core.config import get_settings
from app.db.session import Base, engine

# Import models so SQLAlchemy knows the metadata before create_all.
import app.models  # noqa: F401


def create_app() -> FastAPI:
    settings = get_settings()
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(notes_router)
    app.mount("/media", StaticFiles(directory=settings.upload_dir), name="media")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
