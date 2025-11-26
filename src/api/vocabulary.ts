import api from './client';
import type {
  Flashcard,
  PublicDeckResponse,
  VocabularyDeck,
  VocabularyWord
} from './types';

export const fetchDecks = async (): Promise<VocabularyDeck[]> => {
  const { data } = await api.get<VocabularyDeck[]>('/vocabulary/decks');
  return data;
};

export const createDeck = async (payload: {
  name: string;
  description?: string;
  is_public: boolean;
}) => {
  const { data } = await api.post<VocabularyDeck>('/vocabulary/decks', payload);
  return data;
};

export const updateDeck = async (deckId: string, payload: Partial<{ name: string; description: string; is_public: boolean }>) => {
  const { data } = await api.patch<VocabularyDeck>(`/vocabulary/decks/${deckId}`, payload);
  return data;
};

export const addDeckMember = async (deckId: string, email: string) => {
  const { data } = await api.post<VocabularyDeck>(`/vocabulary/decks/${deckId}/members`, { email });
  return data;
};

export const fetchDeckWords = async (deckId: string): Promise<VocabularyWord[]> => {
  const { data } = await api.get<VocabularyWord[]>(`/vocabulary/decks/${deckId}/words`);
  return data;
};

export const addDeckWord = async (
  deckId: string,
  payload: {
    word: string;
    phonetic?: string;
    definition: string;
    part_of_speech?: string;
    notes?: string;
    explanation?: string;
    example?: string;
    tags?: string[];
  }
) => {
  const { data } = await api.post<VocabularyWord>(`/vocabulary/decks/${deckId}/words`, payload);
  return data;
};

export const updateDeckWord = async (deckId: string, wordId: string, payload: Partial<VocabularyWord>) => {
  const { data } = await api.put<VocabularyWord>(`/vocabulary/decks/${deckId}/words/${wordId}`, payload);
  return data;
};

export const deleteDeckWord = async (deckId: string, wordId: string) => {
  await api.delete(`/vocabulary/decks/${deckId}/words/${wordId}`);
};

export const fetchPublicDeck = async (token: string): Promise<PublicDeckResponse> => {
  const { data } = await api.get<PublicDeckResponse>(`/vocabulary/public/${token}`);
  return data;
};

export const fetchDeckFlashcards = async (deckId: string): Promise<Flashcard[]> => {
  const { data } = await api.get<Flashcard[]>(`/vocabulary/decks/${deckId}/flashcards`);
  return data;
};

export const bulkAddWords = async (
  deckId: string,
  words: Array<{
    word: string;
    phonetic?: string;
    definition: string;
    part_of_speech?: string;
    notes?: string;
    explanation?: string;
    example?: string;
    tags?: string[];
  }>
) => {
  const { data } = await api.post<{ count: number; status: string }>(
    `/vocabulary/decks/${deckId}/words/bulk`,
    { words }
  );
  return data;
};


