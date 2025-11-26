import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { generateTTS } from '../api/speaking';
import { createAudioUrl, revokeAudioUrl } from '../utils/audio';

const TTSButton = ({ text, disabled }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const ttsMutation = useMutation({
    mutationFn: generateTTS,
    onSuccess: (blob) => {
      if (audioUrl) {
        revokeAudioUrl(audioUrl);
      }
      const url = createAudioUrl(blob);
      setAudioUrl(url);
      audioRef.current?.play().catch(() => {
        toast.success('Đã tạo audio, bấm play để nghe.');
      });
    },
    onError: () => toast.error('Không tạo được giọng đọc. Thử lại sau.')
  });

  useEffect(
    () => () => {
      if (audioUrl) {
        revokeAudioUrl(audioUrl);
      }
    },
    [audioUrl]
  );

  const handleClick = () => {
    if (!text?.trim()) {
      toast.error('Không có nội dung để đọc.');
      return;
    }
    ttsMutation.mutate(text);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded-full border border-primary px-6 py-3 text-sm font-semibold disabled:opacity-40"
        onClick={handleClick}
        disabled={disabled || ttsMutation.isPending}
      >
        {ttsMutation.isPending ? 'Đang tạo giọng đọc...' : 'Nghe Edge-TTS'}
      </button>
      {audioUrl && (
        <audio ref={audioRef} controls src={audioUrl} className="w-full">
          Audio không được hỗ trợ.
        </audio>
      )}
    </div>
  );
};

export default TTSButton;





