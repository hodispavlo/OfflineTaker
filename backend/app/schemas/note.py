from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.note import NoteStatus


class TranscriptSegmentRead(BaseModel):
    id: int
    speaker_label: str
    text: str
    start_time: float
    end_time: float

    model_config = ConfigDict(from_attributes=True)


class SummaryRead(BaseModel):
    id: int
    summary_markdown: str
    action_items: str

    model_config = ConfigDict(from_attributes=True)


class NoteListItem(BaseModel):
    id: int
    title: str
    duration: Optional[float]
    status: NoteStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteRead(NoteListItem):
    audio_url: str
    error_message: Optional[str]
    transcript_segments: list[TranscriptSegmentRead] = []
    summary: Optional[SummaryRead] = None


class UploadResponse(BaseModel):
    note_id: int
    status: NoteStatus
    message: str
