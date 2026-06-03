from typing import Optional

from app.core.config import Settings
from app.services.profession_profiles import resolve_profession_profile
from app.services.transcription import TranscriptChunk


async def summarize_transcript(
    chunks: list[TranscriptChunk],
    settings: Settings,
    profession_profile: Optional[str] = None,
) -> tuple[str, str]:
    transcript = "\n".join(
        f"[{chunk.start_time:.1f}-{chunk.end_time:.1f}] {chunk.speaker_label}: {chunk.text}"
        for chunk in chunks
    )
    resolved_profile, profile_prompt = resolve_profession_profile(profession_profile)

    if not settings.openai_api_key:
        return _mock_summary(chunks, resolved_profile)

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You turn diarized meeting transcripts into concise Markdown notes. "
                    "Return sections named Key Takeaways and Action Items. Keep medical, legal, "
                    "and private content factual; do not invent details.\n\n"
                    f"Active profession preset: {resolved_profile}.\n{profile_prompt}"
                ),
            },
            {"role": "user", "content": transcript},
        ],
        temperature=0.2,
    )
    summary = response.choices[0].message.content or ""
    action_items = _extract_action_items(summary)
    return summary, action_items


def _mock_summary(chunks: list[TranscriptChunk], profession_profile: str = "Universal") -> tuple[str, str]:
    speaker_count = len({chunk.speaker_label for chunk in chunks})
    summary = (
        "## Key Takeaways\n"
        f"- Processed {len(chunks)} transcript segments across {speaker_count} speaker(s).\n"
        f"- Active AI profile: {profession_profile}.\n"
        "- Real summarization will run when OPENAI_API_KEY is configured.\n\n"
        "## Action Items\n"
        "- Add provider API keys in backend/.env.\n"
        "- Replace the mock transcript by setting AI_PROVIDER=deepgram or AI_PROVIDER=assemblyai.\n"
    )
    return summary, "- Add provider API keys.\n- Enable a transcription provider."


def _extract_action_items(summary: str) -> str:
    marker = "## Action Items"
    if marker not in summary:
        return ""
    return summary.split(marker, maxsplit=1)[1].strip()
