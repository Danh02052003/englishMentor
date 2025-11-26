import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  useAddMemberMutation,
  useCreateDeckMutation,
  useDeckFlashcards,
  useDeckWords,
  useVocabDecks,
  useWordMutations
} from '../../api/hooks';
import api from '../../api/client';
import BulkWordImport from '../../components/BulkWordImport';
import DeckSidebar from '../../components/DeckSidebar';
import SmartFlashcardStudy from '../../components/SmartFlashcardStudy';
import WordCard from '../../components/WordCard';
import WordForm from '../../components/WordForm';
import type { VocabularyWord } from '../../api/types';

const defaultWordState: Partial<VocabularyWord> = {
  word: '',
  phonetic: '',
  part_of_speech: '',
  definition: '',
  explanation: '',
  notes: '',
  example: '',
  tags: []
};

const VocabTrainer = () => {
  const decksQuery = useVocabDecks();
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<VocabularyWord>>(defaultWordState);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: '', description: '', is_public: true });
  const [studyMode, setStudyMode] = useState<'manage' | 'study'>('manage');
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const addMember = useAddMemberMutation();
  const createDeck = useCreateDeckMutation();

  const decks = decksQuery.data ?? [];
  useEffect(() => {
    if (!activeDeckId && decks.length) {
      setActiveDeckId(decks[0]._id ?? decks[0].id ?? null);
    }
  }, [decks, activeDeckId]);

  const wordsQuery = useDeckWords(activeDeckId ?? undefined);
  const flashcardsQuery = useDeckFlashcards(activeDeckId ?? undefined);
  const wordMutations = useWordMutations(activeDeckId ?? undefined);

  const selectedDeck = decks.find((deck) => (deck._id ?? deck.id) === activeDeckId);
  const publicURL = selectedDeck
    ? `${window.location.origin}/public/deck/${selectedDeck.public_token}`
    : '';

  const handleFormChange = (field: keyof VocabularyWord, value: string) => {
    if (field === 'tags') {
      setFormState((prev) => ({ ...prev, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean) }));
      return;
    }
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddWord = () => {
    if (!activeDeckId) {
      toast.error('Hãy chọn một deck trước');
      return;
    }
    if (!formState.word?.trim() || !formState.definition?.trim()) {
      toast.error('Word và Meaning là bắt buộc');
      return;
    }
    if (editingWordId) {
      wordMutations.update.mutate(
        { wordId: editingWordId, payload: formState as any },
        {
          onSuccess: () => {
            setEditingWordId(null);
            setFormState(defaultWordState);
          }
        }
      );
      return;
    }
    wordMutations.create.mutate(formState as any, {
      onSuccess: () => {
        setFormState(defaultWordState);
      }
    });
  };

  const handleInvite = () => {
    if (!activeDeckId || !inviteEmail.trim()) return;
    addMember.mutate(
      { deckId: activeDeckId, email: inviteEmail.trim() },
      {
        onSuccess: () => setInviteEmail('')
      }
    );
  };

  const handleCreateDeck = () => {
    if (!newDeck.name.trim()) {
      toast.error('Deck name is required');
      return;
    }
    createDeck.mutate(newDeck, {
      onSuccess: (deck) => {
        setShowCreate(false);
        setNewDeck({ name: '', description: '', is_public: true });
        setActiveDeckId(deck._id ?? deck.id ?? null);
      }
    });
  };

  if (decksQuery.isLoading) {
    return <p className="text-slate-400">Loading decks...</p>;
  }

  if (decksQuery.isError) {
    return <p className="text-red-400">Could not load decks. Please try again.</p>;
  }

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6">
      <DeckSidebar
        decks={decks}
        activeDeckId={activeDeckId}
        onSelect={setActiveDeckId}
        onCreateClick={() => setShowCreate(true)}
      />
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-3">
            <h3 className="text-xl font-semibold">New Vocabulary Deck</h3>
            <input
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-2"
              placeholder="Deck name"
              value={newDeck.name}
              onChange={(e) => setNewDeck((prev) => ({ ...prev, name: e.target.value }))}
            />
            <textarea
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-2"
              placeholder="Description"
              value={newDeck.description}
              onChange={(e) => setNewDeck((prev) => ({ ...prev, description: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={newDeck.is_public}
                onChange={(e) => setNewDeck((prev) => ({ ...prev, is_public: e.target.checked }))}
              />
              Allow public access via link
            </label>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-full border border-slate-700"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-primary font-semibold disabled:opacity-40"
                onClick={handleCreateDeck}
                disabled={createDeck.isPending}
              >
                {createDeck.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {selectedDeck ? (
          <div className="rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{selectedDeck.name}</h2>
                <p className="text-sm text-slate-400">{selectedDeck.description || 'Shared IELTS vocabulary deck'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStudyMode(studyMode === 'manage' ? 'study' : 'manage')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    studyMode === 'study'
                      ? 'bg-primary text-white'
                      : 'border border-slate-700 text-slate-400 hover:border-primary'
                  }`}
                >
                  {studyMode === 'manage' ? 'Ôn tập' : 'Quản lý'}
                </button>
                {studyMode === 'manage' && (
                  <>
                    <input
                      className="rounded-2xl border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm"
                      value={publicURL}
                      readOnly
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      className="rounded-full border border-primary px-3 py-1 text-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(publicURL);
                        toast.success('Đã copy link public');
                      }}
                    >
                      Copy link
                    </button>
                  </>
                )}
              </div>
            </div>
            {studyMode === 'manage' && (
              <div className="flex flex-wrap gap-2">
                <input
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm"
                  placeholder="Invite friend via email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-40"
                  onClick={handleInvite}
                  disabled={addMember.isPending}
                >
                  Invite
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Create a deck to start collecting shared vocabulary.</p>
        )}

        {studyMode === 'study' ? (
          <>
            {wordsQuery.isLoading && <p className="text-slate-400">Loading words...</p>}
            {wordsQuery.isError && (
              <p className="text-red-400 text-sm">Không tải được từ. Chắc chắn bạn có quyền truy cập deck này.</p>
            )}
            {wordsQuery.data && wordsQuery.data.length > 0 ? (
              <SmartFlashcardStudy
                words={wordsQuery.data}
                flashcards={flashcardsQuery.data}
                onComplete={() => {
                  toast.success('🎉 Đã hoàn thành tất cả từ!');
                  setStudyMode('manage');
                }}
              />
            ) : (
              <p className="text-slate-500 text-sm">Chưa có từ nào để ôn tập. Hãy thêm từ ở chế độ quản lý.</p>
            )}
          </>
        ) : (
          <>
            {/* Toggle between single and bulk add */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  addMode === 'single'
                    ? 'bg-primary text-white'
                    : 'border border-slate-700 text-slate-400 hover:border-primary'
                }`}
              >
                Thêm từng từ
              </button>
              <button
                type="button"
                onClick={() => setAddMode('bulk')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  addMode === 'bulk'
                    ? 'bg-primary text-white'
                    : 'border border-slate-700 text-slate-400 hover:border-primary'
                }`}
              >
                Thêm hàng loạt
              </button>
            </div>

            {addMode === 'single' ? (
              <WordForm
                values={formState}
                onChange={handleFormChange}
                onSubmit={handleAddWord}
                isSubmitting={wordMutations.create.isPending || wordMutations.update.isPending}
                submitLabel={editingWordId ? 'Save changes' : 'Add word'}
              />
            ) : (
              activeDeckId && (
                <BulkWordImport
                  deckId={activeDeckId}
                  onSuccess={() => {
                    setAddMode('single');
                  }}
                />
              )
            )}

            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Deck words</h3>
              {wordsQuery.isLoading && <p className="text-slate-400">Loading shared words...</p>}
              {wordsQuery.isError && (
                <p className="text-red-400 text-sm">Không tải được từ. Chắc chắn bạn có quyền truy cập deck này.</p>
              )}
              {!wordsQuery.data?.length && !wordsQuery.isLoading && (
                <p className="text-slate-500 text-sm">Chưa có từ nào. Hãy thêm từ phía trên nhé.</p>
              )}
              <div className="space-y-4">
                {wordsQuery.data?.map((word) => (
                  <WordCard
                    key={word._id ?? word.id}
                    word={word}
                    onDelete={(wordId) => wordMutations.remove.mutate(wordId, { onSuccess: () => setEditingWordId(null) })}
                    onEdit={(w) => {
                      setEditingWordId(w._id ?? w.id ?? null);
                      setFormState({ ...w });
                    }}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default VocabTrainer;

