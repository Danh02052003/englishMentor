export interface User {
  id: string;
  full_name: string;
  email: string;
  xp: number;
  coins: number;
  streak: number;
  level: string;
  badges: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ReadingQuestion {
  question_id: string;
  question_type: 'mcq' | 'tfng' | 'fill' | 'match' | string;
  prompt: string;
  options?: string[];
  correct_answer?: string;
  correct_answers?: string[];
  meta?: {
    type?: string;
    answerFormat?: 'single' | 'multi' | 'multi-select';
    expectedCount?: number;
    instructions?: string;
  };
}

export interface ReadingTest {
  id?: string;
  _id?: string;
  title: string;
  passage: string;
  difficulty: string;
  timer_minutes: number;
  questions: ReadingQuestion[];
}

export interface ListeningSentence {
  sentence_id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  hint_word_count: number;
  hint_first_letters: string[];
}

export interface ListeningTest {
  id?: string;
  _id?: string;
  title: string;
  audio_url: string;
  sentences: ListeningSentence[];
}

export interface Flashcard {
  id?: string;
  _id?: string;
  front: string;
  back: string;
  example?: string;
  level: string;
  next_review_at?: string;
}

export interface MockTest {
  id?: string;
  _id?: string;
  title: string;
  sections: string[];
  duration_minutes: number;
}

export interface DashboardSummary {
  xp: number;
  coins: number;
  streak: number;
  level: string;
  recent_words: string[];
  heatmap: { date: string; minutes: number }[];
  weak_skills: { skill: string; score: number; trend: number }[];
  study_plan: string[];
}

export interface VocabularyDeck {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  owner_id: string;
  member_ids: string[];
  is_public: boolean;
  public_token: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VocabularyWord {
  id?: string;
  _id?: string;
  deck_id: string;
  word: string;
  phonetic?: string;
  definition: string;
  part_of_speech?: string;
  notes?: string;
  explanation?: string;
  example?: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PublicDeckResponse {
  deck: VocabularyDeck;
  words: VocabularyWord[];
}

