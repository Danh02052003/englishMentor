export const createAudioUrl = (blob) => {
  if (!blob) return null;
  return URL.createObjectURL(blob);
};

export const revokeAudioUrl = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};





