# OfflineTaker MVP Roadmap

## Core audience

The MVP targets people who need to stay present in offline conversations while still leaving with accurate notes:

- Doctors and clinicians.
- Journalists and interviewers.
- Students.
- Corporate managers.

## Pain points

- Split focus from typing notes while trying to stay engaged.
- Noisy offline environments that degrade generic transcription quality.
- Speaker diarization from one microphone.
- Privacy requirements for medical, legal, and corporate conversations.

## Primary flows

### Capture and process

1. Open the app.
2. Tap Record.
3. Stop recording.
4. Save the audio locally first.
5. Upload securely to the backend.
6. Backend transcribes, diarizes, and summarizes.
7. App polls until the note is ready.

### Review and action

1. Open a completed note.
2. Review structured summary and action items.
3. Inspect transcript by speaker and timestamp.
4. Tap transcript segments to seek audio.
5. Export or sync to downstream systems in a later release.

## Architecture

```text
Mobile Client: Expo React Native
  |
  | HTTPS audio upload
  v
Backend API: FastAPI
  |
  +-- Database: SQLAlchemy now, Postgres-ready
  +-- Audio API: Deepgram or AssemblyAI
  +-- LLM API: OpenAI
```

## Implementation phases

### Phase 1: Backend

- Create FastAPI project structure.
- Define SQLAlchemy models for users, notes, transcripts, summaries.
- Implement audio upload.
- Add background processing.
- Add Deepgram and AssemblyAI adapters.
- Add OpenAI summarization.

### Phase 2: Mobile infrastructure

- Initialize Expo TypeScript app.
- Add navigation.
- Build dashboard, recorder, and note detail screens.
- Upload audio with metadata.

### Phase 3: Note consumption

- Render summary Markdown.
- Render speaker-labeled transcript.
- Add audio playback and transcript seek behavior.

### Phase 4: Production hardening

- Add auth.
- Add durable cloud storage.
- Add migrations.
- Add provider webhook handling for long audio.
- Add export destinations.
- Add security controls and compliance documentation.
