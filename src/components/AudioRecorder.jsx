import { useEffect, useMemo, useState } from 'react';
import useRecorder from '../hooks/useRecorder';
import { createAudioUrl, revokeAudioUrl } from '../utils/audio';

const AudioRecorder = ({ onAudioReady }) => {
  const { isRecording, audioBlob, error, startRecording, stopRecording, resetRecording } = useRecorder();
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (audioBlob) {
      const url = createAudioUrl(audioBlob);
      setAudioUrl(url);
      onAudioReady?.(audioBlob);
      return () => revokeAudioUrl(url);
    }
    return undefined;
  }, [audioBlob, onAudioReady]);

  const status = useMemo(() => {
    if (isRecording) return 'Đang ghi...';
    if (audioBlob) return 'Đã ghi âm xong';
    return 'Bấm để bắt đầu ghi âm';
  }, [audioBlob, isRecording]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
      <div>
        <p className="text-sm text-slate-400">{status}</p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-full bg-primary py-3 font-semibold disabled:opacity-40"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Dừng ghi' : 'Bắt đầu ghi'}
        </button>
        <button
          type="button"
          className="px-4 py-3 rounded-full border border-slate-700 text-sm disabled:opacity-40"
          onClick={resetRecording}
          disabled={!audioBlob}
        >
          Ghi lại
        </button>
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} className="w-full">
          Trình duyệt của bạn không hỗ trợ audio.
        </audio>
      )}
    </div>
  );
};

export default AudioRecorder;





