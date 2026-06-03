export type NoteStatus = "processing" | "completed" | "failed";

export type TranscriptSegment = {
  id: number;
  speaker_label: string;
  text: string;
  start_time: number;
  end_time: number;
};

export type Summary = {
  id: number;
  summary_markdown: string;
  action_items: string;
};

export type NoteListItem = {
  id: number;
  title: string;
  duration: number | null;
  status: NoteStatus;
  created_at: string;
};

export type Note = NoteListItem & {
  audio_url: string;
  error_message: string | null;
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
};

export type RootStackParamList = {
  Dashboard: undefined;
  Recorder: undefined;
  NoteDetail: { noteId: number };
  Settings: undefined;
};
