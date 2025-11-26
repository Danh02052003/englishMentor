import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import AudioRecorder from '../components/AudioRecorder';
import TTSButton from '../components/TTSButton';
import SpeakingScoreCard from '../components/SpeakingScoreCard';
import {
  fetchSpeakingPrompts,
  scorePronunciation,
  transcribeAudio
} from '../api/speaking';

const SpeakingPractice = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [scoreResult, setScoreResult] = useState(null);
  const [expectedText, setExpectedText] = useState('');

  const promptsQuery = useQuery({
    queryKey: ['speaking-prompts'],
    queryFn: fetchSpeakingPrompts,
    onSuccess: (data) => {
      if (data?.length && !expectedText) {
        setExpectedText(data[0].scenario);
      }
    }
  });

  const sttMutation = useMutation({
    mutationFn: transcribeAudio,
    onSuccess: (data) => {
      setTranscript(data.text);
      toast.success('Đã chuyển giọng nói thành văn bản');
    },
    onError: () => toast.error('Audio quá nhỏ, vui lòng ghi âm lại.')
  });

  const scoringMutation = useMutation({
    mutationFn: scorePronunciation,
    onSuccess: (data) => {
      setScoreResult(data);
      toast.success('Đã chấm điểm bài nói');
    },
    onError: () => toast.error('Không thể chấm điểm, hãy thử lại.')
  });

  const promptsOptions = useMemo(
    () => promptsQuery.data ?? [],
    [promptsQuery.data]
  );

  const handleTranscribe = () => {
    if (!audioBlob) {
      toast.error('Hãy ghi âm trước khi chuyển thành text');
      return;
    }
    sttMutation.mutate(audioBlob);
  };

  const handleScore = () => {
    if (!expectedText.trim()) {
      toast.error('Nhập nội dung mẫu để so sánh.');
      return;
    }
    if (!transcript.trim()) {
      toast.error('Chưa có transcript để chấm điểm.');
      return;
    }
    scoringMutation.mutate({
      expected_text: expectedText,
      spoken_text: transcript
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase text-slate-500">Chủ đề</p>
            <h1 className="text-2xl font-semibold">IELTS Speaking Coach</h1>
          </div>
          <TTSButton
            text={expectedText}
            disabled={!expectedText}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase text-slate-500">Chọn prompt</label>
          <select
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-sm"
            value={expectedText}
            onChange={(event) => setExpectedText(event.target.value)}
          >
            {promptsOptions.map((prompt) => (
              <option key={prompt.topic} value={prompt.scenario}>
                {prompt.topic} — {prompt.scenario.slice(0, 60)}...
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm"
          rows={4}
          value={expectedText}
          onChange={(event) => setExpectedText(event.target.value)}
          placeholder="Nhập nội dung mẫu mà bạn muốn luyện nói..."
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <AudioRecorder onAudioReady={setAudioBlob} />
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400">Transcript từ Whisper</p>
            <button
              type="button"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-40"
              onClick={handleTranscribe}
              disabled={sttMutation.isPending}
            >
              {sttMutation.isPending ? 'Đang chuyển...' : 'Chuyển sang text'}
            </button>
          </div>
          <textarea
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 h-48 text-sm"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Transcript sẽ hiển thị ở đây..."
          />
          <p className="text-xs text-slate-500">
            Tip: nếu kết quả chưa chính xác, hãy ghi âm lớn hơn hoặc gần micro hơn.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-slate-400">Chấm điểm phát âm & fluency</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 font-semibold disabled:opacity-40"
            onClick={handleScore}
            disabled={scoringMutation.isPending}
          >
            {scoringMutation.isPending ? 'Đang chấm...' : 'Chấm điểm ngay'}
          </button>
        </div>
        <SpeakingScoreCard result={scoreResult} />
      </section>
    </div>
  );
};

export default SpeakingPractice;





