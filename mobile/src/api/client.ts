import { Note, NoteListItem } from "../types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function listNotes(): Promise<NoteListItem[]> {
  return request<NoteListItem[]>("/api/notes");
}

export async function getNote(noteId: number): Promise<Note> {
  const note = await request<Note>(`/api/notes/${noteId}`);
  return {
    ...note,
    audio_url: resolveUrl(note.audio_url),
  };
}

export async function uploadRecording(params: {
  uri: string;
  title: string;
  durationSeconds?: number;
}): Promise<{ note_id: number; status: string; message: string }> {
  const formData = new FormData();
  formData.append("title", params.title);
  if (params.durationSeconds !== undefined) {
    formData.append("duration", String(params.durationSeconds));
  }
  formData.append("file", {
    uri: params.uri,
    name: `recording-${Date.now()}.m4a`,
    type: "audio/m4a",
  } as unknown as Blob);

  return request("/api/notes/upload", {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
}

export function retryNote(noteId: number): Promise<{ note_id: number; status: string; message: string }> {
  return request(`/api/notes/${noteId}/retry`, { method: "POST" });
}

function resolveUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file://")) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
}
