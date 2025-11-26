export const createAudioUrl = (blob: Blob | null) => {
  if (!blob) return null;
  return URL.createObjectURL(blob);
};

export const revokeAudioUrl = (url: string | null) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};





