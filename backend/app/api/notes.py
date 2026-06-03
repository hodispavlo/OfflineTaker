from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.note import Note, NoteStatus
from app.schemas.note import NoteListItem, NoteRead, UploadResponse
from app.services.processing import process_note

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_note(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(default="Untitled recording"),
    duration: Optional[float] = Form(default=None),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> UploadResponse:
    suffix = Path(file.filename or "recording.m4a").suffix or ".m4a"
    filename = f"{uuid4().hex}{suffix}"
    audio_path = settings.upload_dir / filename

    with audio_path.open("wb") as destination:
        while chunk := await file.read(1024 * 1024):
            destination.write(chunk)

    note = Note(
        title=title,
        audio_url=f"/media/{filename}",
        duration=duration,
        status=NoteStatus.processing,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    background_tasks.add_task(process_note, note.id, audio_path)
    return UploadResponse(note_id=note.id, status=note.status, message="Audio uploaded and queued.")


@router.get("", response_model=list[NoteListItem])
def list_notes(db: Session = Depends(get_db)) -> list[Note]:
    return list(db.scalars(select(Note).order_by(Note.created_at.desc())).all())


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, db: Session = Depends(get_db)) -> Note:
    note = db.scalar(
        select(Note)
        .where(Note.id == note_id)
        .options(selectinload(Note.transcript_segments), selectinload(Note.summary))
    )
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note
