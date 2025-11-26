import api from './client';

export interface SpeakingPrompt {
  topic: string;
  scenario: string;
  hints?: string[];
}

export interface TranscriptionResponse {
  text: string;
}

export interface SpeakingScorePayload {
  expected_text: string;
  spoken_text: string;
}

export interface SpeakingScoreResult {
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  band?: number;
  pronunciation?: number;
  coherence?: number;
  lexical?: number;
  overall_band?: number;
  feedback?: string;
}

export const fetchSpeakingPrompts = async () => {
  const { data } = await api.get<SpeakingPrompt[]>('/speaking/prompts');
  return data;
};

export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const { data } = await api.post<TranscriptionResponse>('/speaking/stt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const generateTTS = async (text: string) => {
  const response = await api.post<Blob>(
    '/speaking/tts',
    { text },
    { responseType: 'blob' }
  );
  return response.data;
};

export const scorePronunciation = async (payload: SpeakingScorePayload) => {
  const { data } = await api.post<SpeakingScoreResult>('/speaking/score', payload);
  return data;
};
