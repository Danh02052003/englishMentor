import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import api from './client';
import {
  addDeckMember,
  addDeckWord,
  createDeck,
  deleteDeckWord,
  fetchDeckFlashcards,
  fetchDeckWords,
  fetchDecks,
  updateDeck,
  updateDeckWord
} from './vocabulary';
import type {
  DashboardSummary,
  Flashcard,
  ListeningTest,
  ReadingTest,
  TokenResponse,
  VocabularyDeck,
  VocabularyWord
} from './types';

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/dashboard');
      return data;
    }
  });

export const useReadingTests = () =>
  useQuery({
    queryKey: ['reading-tests'],
    queryFn: async () => {
      const { data } = await api.get<ReadingTest[]>('/reading/tests');
      return data;
    }
  });

export const useListeningTests = () =>
  useQuery({
    queryKey: ['listening-tests'],
    queryFn: async () => {
      const { data } = await api.get<ListeningTest[]>('/listening/tests');
      return data;
    }
  });

export const useFlashcards = () =>
  useQuery({
    queryKey: ['flashcards'],
    queryFn: async () => {
      const { data } = await api.get<Flashcard[]>('/flashcards');
      return data;
    }
  });

export const useAuthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      console.log('Making login request:', payload);
      try {
      const { data } = await api.post<TokenResponse>('/auth/login', payload);
        console.log('Login API response:', data);
      return data;
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Hi ${data.user.full_name}, welcome back!`);
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    }
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; name: string }) => {
      const requestData = {
        email: payload.email,
        password: payload.password,
        full_name: payload.name
      };
      console.log('Making register request:', requestData);
      try {
        const { data } = await api.post<TokenResponse>('/auth/register', requestData);
        console.log('Register API response:', data);
      return data;
      } catch (error) {
        console.error('Register API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Welcome ${data.user.full_name}! Your account has been created.`);
    },
    onError: (error) => {
      console.error('Register mutation error:', error);
    }
  });
};

// Vocabulary decks -------------------------------------------------------

export const useVocabDecks = () =>
  useQuery({
    queryKey: ['vocab-decks'],
    queryFn: fetchDecks
  });

export const useDeckWords = (deckId?: string) =>
  useQuery({
    queryKey: ['vocab-words', deckId],
    queryFn: () => fetchDeckWords(deckId as string),
    enabled: Boolean(deckId)
  });

export const useDeckFlashcards = (deckId?: string) =>
  useQuery({
    queryKey: ['vocab-flashcards', deckId],
    queryFn: () => fetchDeckFlashcards(deckId as string),
    enabled: Boolean(deckId)
  });

export const useCreateDeckMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeck,
    onSuccess: (deck) => {
      toast.success('Đã tạo deck mới');
      queryClient.setQueryData<VocabularyDeck[]>(['vocab-decks'], (old) => (old ? [deck, ...old] : [deck]));
    }
  });
};

export const useUpdateDeckMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deckId, payload }: { deckId: string; payload: Partial<VocabularyDeck> }) =>
      updateDeck(deckId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật deck');
      queryClient.invalidateQueries({ queryKey: ['vocab-decks'] });
    }
  });
};

export const useAddMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deckId, email }: { deckId: string; email: string }) => addDeckMember(deckId, email),
    onSuccess: () => {
      toast.success('Đã thêm thành viên');
      queryClient.invalidateQueries({ queryKey: ['vocab-decks'] });
    }
  });
};

export const useWordMutations = (deckId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (deckId) {
      queryClient.invalidateQueries({ queryKey: ['vocab-words', deckId] });
    }
  };

  const create = useMutation({
    mutationFn: (payload: Parameters<typeof addDeckWord>[1]) => addDeckWord(deckId as string, payload),
    onSuccess: () => {
      toast.success('Đã thêm từ mới');
      invalidate();
    }
  });

  const update = useMutation({
    mutationFn: ({ wordId, payload }: { wordId: string; payload: Partial<VocabularyWord> }) =>
      updateDeckWord(deckId as string, wordId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật từ');
      invalidate();
    }
  });

  const remove = useMutation({
    mutationFn: (wordId: string) => deleteDeckWord(deckId as string, wordId),
    onSuccess: () => {
      toast.success('Đã xóa từ');
      invalidate();
    }
  });

  return { create, update, remove };
};

