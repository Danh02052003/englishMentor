import type { Flashcard } from '../api/types';

interface Props {
  card: Flashcard;
  onGrade: (grade: number) => void;
}

const grades = [
  { label: 'Again', grade: 1 },
  { label: 'Hard', grade: 2 },
  { label: 'Good', grade: 4 },
  { label: 'Easy', grade: 5 }
];

const FlashcardView = ({ card, onGrade }: Props) => (
  <div className="rounded-3xl border border-slate-800 p-6 bg-slate-900/60 space-y-4">
    <div>
      <p className="text-xs uppercase text-slate-500">Front</p>
      <p className="text-2xl font-semibold">{card.front}</p>
    </div>
    <div>
      <p className="text-xs uppercase text-slate-500">Back</p>
      <p className="text-lg text-slate-200">{card.back}</p>
      {card.example && <p className="text-sm text-slate-400 mt-2 italic">“{card.example}”</p>}
    </div>
    <div className="flex flex-wrap gap-2">
      {grades.map((option) => (
        <button
          key={option.grade}
          onClick={() => onGrade(option.grade)}
          className="px-4 py-2 rounded-full border border-slate-700 text-sm hover:bg-slate-800"
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export default FlashcardView;

