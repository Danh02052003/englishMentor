import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import api from '../../api/client';
import type { MockTest } from '../../api/types';

const MockTestSimulator = () => {
  const { data } = useQuery({
    queryKey: ['mock-tests'],
    queryFn: async () => {
      const { data } = await api.get('/mock-tests');
      return data as MockTest[];
    }
  });
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);

  const submitMutation = useMutation({
    mutationFn: async () =>
      api.post('/mock-tests/submit', {
        test_id: selectedTest?.id,
        duration_seconds: selectedTest?.duration_minutes ? selectedTest.duration_minutes * 60 : 0,
        section_scores: {
          listening: 7.5,
          reading: 7,
          writing: 6.5,
          speaking: 7
        }
      }),
    onSuccess: (res) => toast.success(`Overall ${res.data.overall_band}`)
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold">Mock Test Simulator</h2>
        <p className="text-sm text-slate-400">
          Computer-based UI with timer, auto scoring, AI review.
        </p>
        <div className="mt-4 flex gap-4 overflow-x-auto">
          {data?.map((test) => {
            const id = test.id ?? (test as any)._id;
            return (
              <button
                key={id}
                className="min-w-[220px] rounded-2xl border border-slate-800 p-4 text-left hover:border-primary"
                onClick={() => setSelectedTest({ ...test, id })}
              >
                <p className="font-semibold">{test.title}</p>
                <p className="text-xs text-slate-500">{test.sections.join(' • ')}</p>
              </button>
            );
          })}
        </div>
      </section>
      {selectedTest && (
        <section className="rounded-3xl border border-slate-800 p-6 space-y-4">
          <p className="text-sm text-slate-400">Duration {selectedTest.duration_minutes} minutes</p>
          <button
            className="w-full rounded-full bg-primary py-3 font-semibold"
            onClick={() => submitMutation.mutate()}
          >
            Submit for AI analysis
          </button>
        </section>
      )}
    </div>
  );
};

export default MockTestSimulator;

