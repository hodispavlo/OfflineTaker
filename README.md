# OfflineTaker

OfflineTaker is an MVP scaffold for a mobile-first meeting recorder that captures audio locally, uploads it to a FastAPI backend, diarizes/transcribes the conversation, and returns a structured summary plus interactive transcript.

## Project layout

- `backend/` - FastAPI API, SQLAlchemy models, upload endpoint, background processing pipeline, and provider adapters.
- `mobile/` - Expo React Native app with dashboard, recorder, note detail, transcript, summary, and audio playback UI.
- `docs/` - product roadmap and implementation notes.

## Backend quick start

```bash
./scripts/backend-start.sh
```

The backend starts in `AI_PROVIDER=mock` mode, so uploads complete without external API keys. For production-quality transcription, use the OpenAI diarized transcription provider below. Deepgram and AssemblyAI remain available alternatives.

Recommended transcription setup for best quality:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe-diarize
```

Free local fallback:

```bash
AI_PROVIDER=local_whisper
LOCAL_WHISPER_MODEL=small
```

## Mobile quick start

```bash
./scripts/setup-node.sh
./scripts/mobile-install.sh
./scripts/mobile-start.sh
```

For a physical phone, run mobile with your computer's LAN IP address:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MAC_LAN_IP:8000 ./scripts/mobile-start.sh
```

## MVP status

Implemented in this scaffold:

- Local recording screen using Expo AV.
- Audio upload to `/api/notes/upload`.
- Processing lifecycle: `processing`, `completed`, `failed`.
- SQLAlchemy models for users, notes, transcript segments, and summaries.
- Pluggable transcription adapters for mock, Deepgram, and AssemblyAI.
- OpenAI summary adapter with a mock fallback.
- Dashboard and note detail screens with summary/transcript tabs.
- Transcript segment taps seek the audio player.

Still to add before production:

- Real authentication and user isolation.
- Cloud object storage for audio files.
- Postgres migrations with Alembic.
- Push notifications.
- HIPAA/GDPR deployment review, encryption policy, audit logs, retention settings, and BAA/vendor due diligence.
