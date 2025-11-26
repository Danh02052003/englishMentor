import clsx from 'clsx';
import type { VocabularyDeck } from '../api/types';

interface Props {
  decks?: VocabularyDeck[];
  activeDeckId?: string | null;
  onSelect: (deckId: string) => void;
  onCreateClick: () => void;
}

const DeckSidebar = ({ decks, activeDeckId, onSelect, onCreateClick }: Props) => (
  <aside className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm uppercase text-slate-500">Decks</h3>
      <button
        type="button"
        className="text-xs rounded-full border border-slate-700 px-3 py-1 hover:border-primary"
        onClick={onCreateClick}
      >
        + Create
      </button>
    </div>
    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
      {decks?.map((deck) => (
        <button
          key={deck._id ?? deck.id}
          type="button"
          className={clsx(
            'w-full text-left rounded-2xl border px-3 py-2 text-sm transition',
            activeDeckId === (deck._id ?? deck.id)
              ? 'border-primary bg-primary/10 text-white'
              : 'border-slate-800 text-slate-300 hover:border-primary/40'
          )}
          onClick={() => onSelect(deck._id ?? deck.id!)}
        >
          <p className="font-semibold">{deck.name}</p>
          {deck.description && <p className="text-xs text-slate-500">{deck.description}</p>}
        </button>
      ))}
      {!decks?.length && (
        <p className="text-xs text-slate-500">No decks yet. Create one to start collaborating.</p>
      )}
    </div>
  </aside>
);

export default DeckSidebar;






