from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.main import app
from app.models.note import Note, NoteStatus, Summary, TranscriptSegment


def test_delete_note_removes_database_rows_and_audio_file() -> None:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    audio_path = settings.upload_dir / "delete-test.m4a"
    audio_path.write_bytes(b"fake audio")

    db = SessionLocal()
    note = Note(title="Delete me", audio_url="/media/delete-test.m4a", status=NoteStatus.completed)
    db.add(note)
    db.commit()
    db.refresh(note)
    note_id = note.id
    db.add(TranscriptSegment(note_id=note_id, speaker_label="Speaker 1", text="Hello", start_time=0, end_time=1))
    db.add(Summary(note_id=note_id, summary_markdown="## Key Takeaways\n- Hello", action_items="- Follow up"))
    db.commit()
    db.close()

    client = TestClient(app)
    response = client.delete(f"/api/notes/{note_id}")

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert not audio_path.exists()

    db = SessionLocal()
    assert db.get(Note, note_id) is None
    assert db.query(TranscriptSegment).filter(TranscriptSegment.note_id == note_id).count() == 0
    assert db.query(Summary).filter(Summary.note_id == note_id).count() == 0
    db.close()


def test_delete_missing_note_returns_404() -> None:
    client = TestClient(app)
    response = client.delete("/api/notes/999999999")

    assert response.status_code == 404
