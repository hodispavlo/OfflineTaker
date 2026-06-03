# OfflineTaker Backend

FastAPI service for accepting audio uploads, processing them through transcription/diarization, and returning summaries plus transcript segments.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## API

- `GET /health` - health check.
- `POST /api/notes/upload` - multipart upload with `file`, optional `title`, optional `duration`.
- `GET /api/notes` - list notes.
- `GET /api/notes/{note_id}` - note detail with summary and transcript segments.

## AI providers

Default mode is `AI_PROVIDER=mock`, which creates a placeholder transcript and summary.

For the clearest transcript with punctuation, speaker labels, timestamps, and structured downstream summaries, use OpenAI transcription:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe-diarize
```

For a free local fallback, use Faster Whisper. It does not provide true speaker diarization by itself, but it gives offline transcription with timestamps:

```bash
AI_PROVIDER=local_whisper
LOCAL_WHISPER_MODEL=small
```

Cloud diarization alternatives remain available:

```bash
AI_PROVIDER=deepgram
DEEPGRAM_API_KEY=...
```

```bash
AI_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=...
```

OpenAI summarization is enabled when `OPENAI_API_KEY` is present.
