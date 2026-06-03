from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.note import Note, NoteStatus, Summary, TranscriptSegment
from app.services.summarization import summarize_transcript
from app.services.transcription import transcribe_audio


async def process_note(note_id: int, audio_path: Path) -> None:
    settings = get_settings()
    db: Session = SessionLocal()
    try:
        note = db.get(Note, note_id)
        if note is None:
            return

        chunks = await transcribe_audio(audio_path, settings)
        summary_markdown, action_items = await summarize_transcript(chunks, settings)

        note.transcript_segments = [
            TranscriptSegment(
                speaker_label=chunk.speaker_label,
                text=chunk.text,
                start_time=chunk.start_time,
                end_time=chunk.end_time,
            )
            for chunk in chunks
        ]
        note.summary = Summary(summary_markdown=summary_markdown, action_items=action_items)
        note.status = NoteStatus.completed
        note.error_message = None
        db.commit()
    except Exception as exc:
        note = db.get(Note, note_id)
        if note is not None:
            note.status = NoteStatus.failed
            note.error_message = str(exc)
            db.commit()
    finally:
        db.close()
