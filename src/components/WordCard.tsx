import type { VocabularyWord } from '../api/types';

interface Props {
  word: VocabularyWord;
  onEdit?: (word: VocabularyWord) => void;
  onDelete?: (wordId: string) => void;
}

const WordCard = ({ word, onEdit, onDelete }: Props) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xl font-semibold">{word.word}</p>
        {word.phonetic && <p className="text-sm text-slate-400">{word.phonetic}</p>}
      </div>
      <div className="flex gap-2 text-xs uppercase text-slate-500">
        {word.part_of_speech && <span>{word.part_of_speech}</span>}
        {word.tags?.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-700 px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <p className="text-slate-200 leading-relaxed">{word.definition}</p>
    {word.explanation && (
      <p className="text-sm text-slate-400">
        <span className="font-semibold text-slate-300">Explanation:</span> {word.explanation}
      </p>
    )}
    {word.notes && (
      <p className="text-sm text-slate-400">
        <span className="font-semibold text-slate-300">Notes:</span> {word.notes}
      </p>
    )}
    {word.example && (
      <p className="text-sm text-primary italic">
        “{word.example}”
      </p>
    )}
    <div className="flex justify-end gap-2 text-xs">
      {onEdit && (
        <button
          type="button"
          className="px-3 py-1 rounded-full border border-slate-700 hover:border-primary"
          onClick={() => onEdit(word)}
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="px-3 py-1 rounded-full border border-red-500/60 text-red-300 hover:border-red-400"
          onClick={() => onDelete(word._id ?? word.id!)}
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default WordCard;






