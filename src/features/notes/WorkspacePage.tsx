import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import api from '../../api/client';

interface WorkspaceDoc {
  id?: string;
  _id?: string;
  title: string;
  blocks?: Array<{ block_id: string; block_type: string; content: string }>;
}

const WorkspacePage = () => {
  const { data } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data } = await api.get('/notes');
      return data as WorkspaceDoc[];
    }
  });
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const activeDoc = useMemo(() => data?.[0], [data]);
  const activeDocId = activeDoc ? activeDoc.id ?? (activeDoc as any)._id : null;

  const saveMutation = useMutation({
    mutationFn: async () =>
      api.post('/notes', {
        document_id: activeDocId,
        title: activeDoc?.title ?? 'Quick Note',
        blocks: [
          {
            block_id: 'body',
            block_type: 'paragraph',
            content: draft
          }
        ]
      }),
    onSuccess: () => {
      toast.success('Workspace saved');
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    }
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="rounded-3xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Workspace</h2>
        <textarea
          className="w-full min-h-[280px] rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
          placeholder="Jot down summaries, grammar notes, or listening scripts..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="w-full rounded-full bg-primary py-3 font-semibold" onClick={() => saveMutation.mutate()}>
          Save block
        </button>
      </section>
      <section className="rounded-3xl border border-slate-800 p-6 space-y-3">
        <h3 className="text-lg font-semibold">Recent blocks</h3>
        {data?.map((doc) => {
          const id = doc.id ?? (doc as any)._id;
          return (
          <article key={id} className="border border-slate-800 rounded-2xl p-4">
            <p className="text-sm text-slate-500">{doc.title}</p>
            {doc.blocks?.map((block) => (
              <p key={block.block_id} className="mt-2 text-slate-200">
                {block.content}
              </p>
            ))}
          </article>
        )})}
      </section>
    </div>
  );
};

export default WorkspacePage;

