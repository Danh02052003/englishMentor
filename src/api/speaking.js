import api from './client';

export const fetchSpeakingPrompts = async () => {
  const { data } = await api.get('/speaking/prompts');
  return data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const { data } = await api.post('/speaking/stt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const generateTTS = async (text) => {
  const response = await api.post(
    '/speaking/tts',
    { text },
    { responseType: 'blob' }
  );
  return response.data;
};

export const scorePronunciation = async (payload) => {
  const { data } = await api.post('/speaking/score', payload);
  return data;
};





