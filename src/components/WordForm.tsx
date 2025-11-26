import { useMemo } from 'react';
import type { VocabularyWord } from '../api/types';

const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'];

interface Props {
  values: Partial<VocabularyWord>;
  onChange: (field: keyof VocabularyWord, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const WordForm = ({ values, onChange, onSubmit, isSubmitting, submitLabel = 'Add word' }: Props) => {
  const tagsString = useMemo(() => values.tags?.join(', ') ?? '', [values.tags]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase text-slate-500">Word</label>
          <input
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-2"
            value={values.word ?? ''}
            onChange={(e) => onChange('word', e.target.value)}
            placeholder="e.g. resilience"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-500">Phonetic</label>
          <input
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-2"
            value={values.phonetic ?? ''}
            onChange={(e) => onChange('phonetic', e.target.value)}
            placeholder="/rɪˈzɪliəns/"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase text-slate-500">Part of speech</label>
          <select
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-2"
            value={values.part_of_speech ?? ''}
            onChange={(e) => onChange('part_of_speech', e.target.value)}
          >
            <option value="">Select...</option>
            {PARTS_OF_SPEECH.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-slate-500">Tags (comma separated)</label>
          <input
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-2"
            value={tagsString}
            onChange={(e) => onChange('tags', e.target.value)}
            placeholder="ielts, speaking, travel"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase text-slate-500">Meaning</label>
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-4 min-h-[100px]"
          value={values.definition ?? ''}
          onChange={(e) => onChange('definition', e.target.value)}
          placeholder="Definition..."
        />
      </div>
      <div>
        <label className="text-xs uppercase text-slate-500">Explanation</label>
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-4 min-h-[80px]"
          value={values.explanation ?? ''}
          onChange={(e) => onChange('explanation', e.target.value)}
          placeholder="Explain why/when to use it..."
        />
      </div>
      <div>
        <label className="text-xs uppercase text-slate-500">Notes</label>
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-4 min-h-[60px]"
          value={values.notes ?? ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Memory hook, synonyms..."
        />
      </div>
      <div>
        <label className="text-xs uppercase text-slate-500">Example sentence</label>
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-4 min-h-[60px]"
          value={values.example ?? ''}
          onChange={(e) => onChange('example', e.target.value)}
          placeholder="Use the word in context..."
        />
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-primary py-3 font-semibold disabled:opacity-40"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
};

export default WordForm;


