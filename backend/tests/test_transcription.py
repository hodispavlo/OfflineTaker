from pathlib import Path

import pytest

from app.core.config import Settings
from app.services.transcription import transcribe_audio


@pytest.mark.anyio
async def test_mock_transcription_returns_segments(tmp_path: Path) -> None:
    audio_path = tmp_path / "sample.m4a"
    audio_path.write_bytes(b"fake audio")

    chunks = await transcribe_audio(audio_path, Settings(ai_provider="mock"))

    assert len(chunks) == 2
    assert chunks[0].speaker_label == "Speaker 1"
    assert "sample.m4a" in chunks[0].text
