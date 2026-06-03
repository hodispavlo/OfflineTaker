from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OfflineTaker API"
    environment: str = "development"
    database_url: str = "sqlite:///./offlinetaker.db"
    upload_dir: Path = Path("uploads")

    deepgram_api_key: Optional[str] = None
    assemblyai_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    ai_provider: str = Field(default="mock", pattern="^(mock|openai|local_whisper|deepgram|assemblyai)$")
    openai_transcription_model: str = "gpt-4o-transcribe-diarize"
    transcription_prompt: str = (
        "Accurate meeting transcript. Preserve original language, punctuation, questions, names, "
        "numbers, medical/legal/business terms, and natural sentence boundaries."
    )
    local_whisper_model: str = "small"
    local_whisper_device: str = "auto"
    local_whisper_compute_type: str = "auto"

    allowed_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return settings
