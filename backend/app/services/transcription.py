from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.core.config import Settings


@dataclass(frozen=True)
class TranscriptChunk:
    speaker_label: str
    text: str
    start_time: float
    end_time: float


async def transcribe_audio(audio_path: Path, settings: Settings) -> list[TranscriptChunk]:
    if settings.ai_provider == "openai":
        return await _transcribe_with_openai(audio_path, settings)
    if settings.ai_provider == "local_whisper":
        return await _transcribe_with_local_whisper(audio_path, settings)
    if settings.ai_provider == "deepgram":
        return await _transcribe_with_deepgram(audio_path, settings)
    if settings.ai_provider == "assemblyai":
        return await _transcribe_with_assemblyai(audio_path, settings)
    return _mock_transcript(audio_path)


async def _transcribe_with_openai(audio_path: Path, settings: Settings) -> list[TranscriptChunk]:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required when AI_PROVIDER=openai")

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    with audio_path.open("rb") as audio:
        if settings.openai_transcription_model == "gpt-4o-transcribe-diarize":
            transcript = await client.audio.transcriptions.create(
                model=settings.openai_transcription_model,
                file=audio,
                response_format="diarized_json",
                chunking_strategy="auto",
            )
        else:
            transcript = await client.audio.transcriptions.create(
                model=settings.openai_transcription_model,
                file=audio,
                response_format="json",
                prompt=settings.transcription_prompt,
            )

    segments = getattr(transcript, "segments", None)
    if segments:
        return [
            TranscriptChunk(
                speaker_label=str(getattr(segment, "speaker", "Speaker 1")),
                text=str(getattr(segment, "text", "")).strip(),
                start_time=float(getattr(segment, "start", 0.0)),
                end_time=float(getattr(segment, "end", 0.0)),
            )
            for segment in segments
            if str(getattr(segment, "text", "")).strip()
        ]

    text = str(getattr(transcript, "text", "")).strip()
    if not text:
        raise RuntimeError("OpenAI transcription returned no text")
    return [TranscriptChunk(speaker_label="Speaker 1", text=text, start_time=0.0, end_time=0.0)]


async def _transcribe_with_local_whisper(audio_path: Path, settings: Settings) -> list[TranscriptChunk]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError(
            "faster-whisper is required when AI_PROVIDER=local_whisper. "
            "Install backend requirements again: .venv/bin/python -m pip install -r requirements.txt"
        ) from exc

    model = WhisperModel(
        settings.local_whisper_model,
        device=settings.local_whisper_device,
        compute_type=settings.local_whisper_compute_type,
    )
    segments, _info = model.transcribe(
        str(audio_path),
        beam_size=5,
        vad_filter=True,
        word_timestamps=False,
        initial_prompt=settings.transcription_prompt,
    )

    chunks = [
        TranscriptChunk(
            speaker_label="Speaker 1",
            text=segment.text.strip(),
            start_time=float(segment.start),
            end_time=float(segment.end),
        )
        for segment in segments
        if segment.text.strip()
    ]
    if not chunks:
        raise RuntimeError("Local Whisper transcription returned no text")
    return chunks


async def _transcribe_with_deepgram(audio_path: Path, settings: Settings) -> list[TranscriptChunk]:
    if not settings.deepgram_api_key:
        raise RuntimeError("DEEPGRAM_API_KEY is required when AI_PROVIDER=deepgram")

    from deepgram import DeepgramClient, PrerecordedOptions

    client = DeepgramClient(settings.deepgram_api_key)
    with audio_path.open("rb") as audio:
        response = client.listen.prerecorded.v("1").transcribe_file(
            {"buffer": audio.read()},
            PrerecordedOptions(model="nova-2", diarize=True, smart_format=True),
        )

    words = response["results"]["channels"][0]["alternatives"][0].get("words", [])
    return _words_to_chunks(words)


async def _transcribe_with_assemblyai(audio_path: Path, settings: Settings) -> list[TranscriptChunk]:
    if not settings.assemblyai_api_key:
        raise RuntimeError("ASSEMBLYAI_API_KEY is required when AI_PROVIDER=assemblyai")

    import assemblyai as aai

    aai.settings.api_key = settings.assemblyai_api_key
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(
        str(audio_path),
        config=aai.TranscriptionConfig(speaker_labels=True),
    )

    if transcript.status == aai.TranscriptStatus.error:
        raise RuntimeError(transcript.error or "AssemblyAI transcription failed")

    return [
        TranscriptChunk(
            speaker_label=f"Speaker {utterance.speaker}",
            text=utterance.text,
            start_time=utterance.start / 1000,
            end_time=utterance.end / 1000,
        )
        for utterance in transcript.utterances or []
    ]


def _words_to_chunks(words: list[dict]) -> list[TranscriptChunk]:
    chunks: list[TranscriptChunk] = []
    current_speaker: Optional[str] = None
    current_words: list[str] = []
    start_time = 0.0
    end_time = 0.0

    for word in words:
        speaker = f"Speaker {word.get('speaker', 0) + 1}"
        if current_speaker is None:
            current_speaker = speaker
            start_time = float(word.get("start", 0.0))

        if speaker != current_speaker and current_words:
            chunks.append(
                TranscriptChunk(
                    speaker_label=current_speaker,
                    text=" ".join(current_words),
                    start_time=start_time,
                    end_time=end_time,
                )
            )
            current_words = []
            current_speaker = speaker
            start_time = float(word.get("start", 0.0))

        current_words.append(str(word.get("punctuated_word") or word.get("word") or ""))
        end_time = float(word.get("end", start_time))

    if current_speaker and current_words:
        chunks.append(
            TranscriptChunk(
                speaker_label=current_speaker,
                text=" ".join(current_words),
                start_time=start_time,
                end_time=end_time,
            )
        )

    return chunks


def _mock_transcript(audio_path: Path) -> list[TranscriptChunk]:
    return [
        TranscriptChunk(
            speaker_label="Speaker 1",
            text=f"Uploaded {audio_path.name}. This placeholder transcript confirms the processing pipeline is wired.",
            start_time=0.0,
            end_time=4.0,
        ),
        TranscriptChunk(
            speaker_label="Speaker 2",
            text="Set AI_PROVIDER and API keys to enable real transcription with diarization.",
            start_time=4.0,
            end_time=8.0,
        ),
    ]
