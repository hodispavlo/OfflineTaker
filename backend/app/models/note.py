from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class NoteStatus(str, PyEnum):
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="Untitled recording")
    audio_url: Mapped[str] = mapped_column(String(1024))
    duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[NoteStatus] = mapped_column(SAEnum(NoteStatus), default=NoteStatus.processing)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notes")
    transcript_segments = relationship(
        "TranscriptSegment",
        back_populates="note",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.start_time",
    )
    summary = relationship("Summary", back_populates="note", cascade="all, delete-orphan", uselist=False)


class TranscriptSegment(Base):
    __tablename__ = "transcripts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), index=True)
    speaker_label: Mapped[str] = mapped_column(String(80))
    text: Mapped[str] = mapped_column(Text)
    start_time: Mapped[float] = mapped_column(Float)
    end_time: Mapped[float] = mapped_column(Float)

    note = relationship("Note", back_populates="transcript_segments")


class Summary(Base):
    __tablename__ = "summaries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), unique=True, index=True)
    summary_markdown: Mapped[str] = mapped_column(Text)
    action_items: Mapped[str] = mapped_column(Text, default="")

    note = relationship("Note", back_populates="summary")
