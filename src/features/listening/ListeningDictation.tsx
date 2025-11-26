import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useListeningTests } from '../../api/hooks';
import api from '../../api/client';

const ListeningDictation = () => {
  const { data, isLoading, isError, error, refetch } = useListeningTests();
  const [selectedSentence, setSelectedSentence] = useState<{ testId: string; sentenceId: string }>();
  const [attempt, setAttempt] = useState('');

  const dictationMutation = useMutation({
    mutationFn: async () =>
      api.post('/listening/dictation', {
        test_id: selectedSentence?.testId,
        sentence_id: selectedSentence?.sentenceId,
        attempt
      }),
    onSuccess: (res) => {
      toast.success(`Accuracy ${Math.round(res.data.accuracy * 100)}% · +${res.data.awarded_xp} XP`);
      setAttempt('');
    }
  });

  if (isLoading) {
    return <p className="text-slate-400">Loading listening drills...</p>;
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không lấy được dữ liệu.';
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-6 space-y-3">
        <p className="text-red-300 text-sm">{message}</p>
        <button
          type="button"
          className="rounded-full border border-red-400 px-4 py-2 text-sm"
          onClick={() => refetch()}
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 text-sm text-slate-300">
        <p>Hiện chưa có bài nghe nào.</p>
        <p>
          đang cập nhật và phát triển
        </p>
      </div>
    );
  }

  const activeTest = data[0];
  const activeTestId = activeTest.id ?? (activeTest as any)._id;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold">{activeTest.title}</h2>
        <p className="text-sm text-slate-400">
          Click a sentence to preview hints, then type the dictation.
        </p>
        <div className="mt-4 space-y-3">
          {activeTest.sentences.map((sentence) => (
            <button
              key={sentence.sentence_id}
              className="w-full text-left rounded-2xl border border-slate-800 px-4 py-3 hover:border-primary"
              onClick={() =>
                setSelectedSentence({ testId: activeTestId, sentenceId: sentence.sentence_id })
              }
            >
              <p className="text-xs text-slate-500">
                Hint: {sentence.hint_word_count} words ·{' '}
                {sentence.hint_first_letters.join(' · ')}
              </p>
              {selectedSentence?.sentenceId === sentence.sentence_id ? (
                <p className="mt-2 text-sm text-slate-300 italic">
                  Slow replay ready — type what you hear.
                </p>
              ) : (
                <p className="mt-2 text-slate-600">•••••••••••</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 p-6 space-y-4">
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-4 min-h-[160px]"
          placeholder="Type what you hear..."
          value={attempt}
          onChange={(event) => setAttempt(event.target.value)}
        />
        <button
          disabled={!selectedSentence}
          className="w-full rounded-full bg-primary py-3 font-semibold disabled:opacity-40"
          onClick={() => dictationMutation.mutate()}
        >
          Submit dictation
        </button>
      </div>
    </div>
  );
};

export default ListeningDictation;

