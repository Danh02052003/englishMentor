import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { fetchPublicDeck } from '../api/vocabulary';
import WordCard from '../components/WordCard';

const PublicDeckPage = () => {
  const { token } = useParams<{ token: string }>();
  const deckQuery = useQuery({
    queryKey: ['public-deck', token],
    queryFn: () => fetchPublicDeck(token || ''),
    enabled: Boolean(token)
  });

  if (deckQuery.isLoading) {
    return <p className="text-slate-400 p-8">Loading deck...</p>;
  }

  if (deckQuery.isError || !deckQuery.data) {
    return (
      <div className="p-8 text-center text-red-400">
        Không tìm thấy deck này hoặc deck đã để private.
      </div>
    );
  }

  const { deck, words } = deckQuery.data;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <h1 className="text-3xl font-semibold">{deck.name}</h1>
        <p className="text-slate-400 mt-2">{deck.description || 'Shared IELTS vocabulary deck'}</p>
        <p className="text-xs text-slate-500 mt-4">
          Public deck • Owner: {deck.owner_id} • Updated at {new Date(deck.updated_at).toLocaleString()}
        </p>
      </div>
      <div className="space-y-4">
        {words.length === 0 && <p className="text-slate-400">Deck chưa có từ nào.</p>}
        {words.map((word) => (
          <WordCard key={word._id ?? word.id} word={word} />
        ))}
      </div>
    </div>
  );
};

export default PublicDeckPage;





