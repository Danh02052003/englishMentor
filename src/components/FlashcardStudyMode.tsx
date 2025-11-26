import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import api from '../api/client';
import TTSButton from './TTSButton';
import type { Flashcard, VocabularyWord } from '../api/types';

type StudyMode = 'flashcard' | 'fill-blank' | 'multiple-choice' | 'listen-write';

interface Props {
  word: VocabularyWord;
  card?: Flashcard;
  allWords?: VocabularyWord[];
  onNext: () => void;
  onSkip: () => void;
}

const FlashcardStudyMode = ({ word, card, allWords = [], onNext, onSkip }: Props) => {
  const [mode, setMode] = useState<StudyMode>('flashcard');
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // Reset state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setUserAnswer('');
    setShowAnswer(false);
    setSelectedChoice(null);
  }, [word._id ?? word.id]);

  const reviewMutation = useMutation({
    mutationFn: async (grade: number) => {
      if (card) {
        return api.post('/vocabulary/review', { card_id: card._id ?? card.id, grade });
      }
      return Promise.resolve({});
    },
    onSuccess: () => {
      toast.success('Đã ghi nhận đánh giá');
      onNext();
    }
  });

  const handleGrade = (grade: number) => {
    if (card) {
      reviewMutation.mutate(grade);
    } else {
      onNext();
    }
  };

  // Generate multiple choice options (word + 3 random distractors from other words)
  const getMultipleChoiceOptions = () => {
    const otherWords = allWords.filter((w) => (w._id ?? w.id) !== (word._id ?? word.id));
    const distractors = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.word);
    const choices = [word.word, ...distractors].sort(() => Math.random() - 0.5);
    return choices.length === 4 ? choices : [word.word, 'example', 'another', 'different'];
  };

  const choices = getMultipleChoiceOptions();

  // Extract blank from example sentence
  const exampleWithBlank = word.example
    ? word.example.replace(new RegExp(word.word, 'gi'), '______')
    : '';

  const renderFlashcardMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6 min-h-[400px] flex flex-col justify-center">
      {!isFlipped ? (
        <>
          <div className="text-center space-y-4">
            <p className="text-xs uppercase text-slate-500">Từ vựng</p>
            <p className="text-4xl font-bold">{word.word}</p>
            {word.phonetic && <p className="text-lg text-slate-400">[{word.phonetic}]</p>}
            {word.part_of_speech && (
              <p className="text-sm text-primary uppercase">{word.part_of_speech}</p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <TTSButton text={word.word} disabled={false} />
            <button
              onClick={() => setIsFlipped(true)}
              className="rounded-full bg-primary px-6 py-3 font-semibold"
            >
              Lật xem đáp án
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-slate-500">Định nghĩa</p>
              <p className="text-xl text-slate-200">{word.definition}</p>
            </div>
            {word.explanation && (
              <div>
                <p className="text-xs uppercase text-slate-500">Giải thích</p>
                <p className="text-base text-slate-300">{word.explanation}</p>
              </div>
            )}
            {word.example && (
              <div>
                <p className="text-xs uppercase text-slate-500">Ví dụ</p>
                <p className="text-base text-slate-300 italic">"{word.example}"</p>
              </div>
            )}
            {word.notes && (
              <div>
                <p className="text-xs uppercase text-slate-500">Ghi chú</p>
                <p className="text-sm text-slate-400">{word.notes}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3 pt-4">
            <button
              onClick={() => handleGrade(5)}
              className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-4 text-green-500 font-semibold hover:bg-green-500/20"
            >
              <div className="text-2xl mb-1">😊</div>
              <div className="text-xs">Dễ</div>
            </button>
            <button
              onClick={() => handleGrade(4)}
              className="rounded-2xl border-2 border-orange-500 bg-orange-500/10 p-4 text-orange-500 font-semibold hover:bg-orange-500/20"
            >
              <div className="text-2xl mb-1">😐</div>
              <div className="text-xs">Trung bình</div>
            </button>
            <button
              onClick={() => handleGrade(2)}
              className="rounded-2xl border-2 border-red-500 bg-red-500/10 p-4 text-red-500 font-semibold hover:bg-red-500/20"
            >
              <div className="text-2xl mb-1">😰</div>
              <div className="text-xs">Khó</div>
            </button>
            <button
              onClick={onSkip}
              className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 p-4 text-blue-500 font-semibold hover:bg-blue-500/20"
            >
              <div className="text-2xl mb-1">▷▷</div>
              <div className="text-xs">Đã biết</div>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderFillBlankMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-500">Định nghĩa</p>
          <p className="text-xl text-slate-200">{word.definition}</p>
        </div>
        {word.example && (
          <div>
            <p className="text-xs uppercase text-slate-500 mb-2">Ví dụ</p>
            <p className="text-lg text-slate-300">
              {exampleWithBlank.split('______').map((part, idx) => (
                <span key={idx}>
                  {part}
                  {idx < exampleWithBlank.split('______').length - 1 && (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="inline-block w-32 mx-1 px-2 py-1 border-b-2 border-primary bg-transparent text-primary font-semibold focus:outline-none"
                      placeholder="..."
                    />
                  )}
                </span>
              ))}
            </p>
          </div>
        )}
        <p className="text-xs text-red-400">
          Chú ý: điền từ gốc (đúng những gì nghe được), không điền theo dạng từ trong ô trống trên câu ví dụ.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex-1 rounded-full border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
        >
          {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
        </button>
        {showAnswer && (
          <div className="flex-1 rounded-2xl border border-primary bg-primary/10 p-3 text-center">
            <p className="text-primary font-semibold">{word.word}</p>
          </div>
        )}
        <button
          onClick={onNext}
          className="rounded-full border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
        >
          Tiếp tục
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 pt-4">
        <button
          onClick={() => handleGrade(5)}
          className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-3 text-green-500 text-sm font-semibold"
        >
          😊 Dễ
        </button>
        <button
          onClick={() => handleGrade(4)}
          className="rounded-2xl border-2 border-orange-500 bg-orange-500/10 p-3 text-orange-500 text-sm font-semibold"
        >
          😐 Trung bình
        </button>
        <button
          onClick={() => handleGrade(2)}
          className="rounded-2xl border-2 border-red-500 bg-red-500/10 p-3 text-red-500 text-sm font-semibold"
        >
          😰 Khó
        </button>
        <button
          onClick={onSkip}
          className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 p-3 text-blue-500 text-sm font-semibold"
        >
          ▷▷ Đã biết
        </button>
      </div>
    </div>
  );

  const renderMultipleChoiceMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500 mb-2">Định nghĩa</p>
        <p className="text-xl text-slate-200">{word.definition}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedChoice(choice);
              setShowAnswer(true);
            }}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              selectedChoice === choice
                ? choice === word.word
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-red-500 bg-red-500/20'
                : 'border-slate-700 hover:border-primary'
            }`}
          >
            <span className="text-sm text-slate-400 mr-2">{idx + 1}.</span>
            <span className="font-semibold">{choice}</span>
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="rounded-2xl border border-primary bg-primary/10 p-4 text-center">
          <p className="text-primary font-semibold">Đáp án: {word.word}</p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => handleGrade(5)}
          className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-3 text-green-500 text-sm font-semibold"
        >
          😊 Dễ
        </button>
        <button
          onClick={() => handleGrade(4)}
          className="rounded-2xl border-2 border-orange-500 bg-orange-500/10 p-3 text-orange-500 text-sm font-semibold"
        >
          😐 Trung bình
        </button>
        <button
          onClick={() => handleGrade(2)}
          className="rounded-2xl border-2 border-red-500 bg-red-500/10 p-3 text-red-500 text-sm font-semibold"
        >
          😰 Khó
        </button>
        <button
          onClick={onSkip}
          className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 p-3 text-blue-500 text-sm font-semibold"
        >
          ▷▷ Đã biết
        </button>
      </div>
    </div>
  );

  const renderListenWriteMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div className="text-center space-y-4">
        <TTSButton text={word.word} disabled={false} />
        <p className="text-sm text-slate-400">Nghe và viết lại từ bạn nghe được</p>
      </div>
      <div>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-xl text-center font-semibold focus:outline-none focus:border-primary"
          placeholder="Điền từ vào đây..."
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex-1 rounded-full border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
        >
          {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
        </button>
        {showAnswer && (
          <div className="flex-1 rounded-2xl border border-primary bg-primary/10 p-3 text-center">
            <p className="text-primary font-semibold">{word.word}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => handleGrade(5)}
          className="rounded-2xl border-2 border-green-500 bg-green-500/10 p-3 text-green-500 text-sm font-semibold"
        >
          😊 Dễ
        </button>
        <button
          onClick={() => handleGrade(4)}
          className="rounded-2xl border-2 border-orange-500 bg-orange-500/10 p-3 text-orange-500 text-sm font-semibold"
        >
          😐 Trung bình
        </button>
        <button
          onClick={() => handleGrade(2)}
          className="rounded-2xl border-2 border-red-500 bg-red-500/10 p-3 text-red-500 text-sm font-semibold"
        >
          😰 Khó
        </button>
        <button
          onClick={onSkip}
          className="rounded-2xl border-2 border-blue-500 bg-blue-500/10 p-3 text-blue-500 text-sm font-semibold"
        >
          ▷▷ Đã biết
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center flex-wrap">
        {(['flashcard', 'fill-blank', 'multiple-choice', 'listen-write'] as StudyMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setIsFlipped(false);
              setUserAnswer('');
              setShowAnswer(false);
              setSelectedChoice(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              mode === m
                ? 'bg-primary text-white'
                : 'border border-slate-700 text-slate-400 hover:border-primary'
            }`}
          >
            {m === 'flashcard' && 'Flashcard'}
            {m === 'fill-blank' && 'Điền chỗ trống'}
            {m === 'multiple-choice' && 'Trắc nghiệm'}
            {m === 'listen-write' && 'Nghe & Viết'}
          </button>
        ))}
      </div>

      {mode === 'flashcard' && renderFlashcardMode()}
      {mode === 'fill-blank' && renderFillBlankMode()}
      {mode === 'multiple-choice' && renderMultipleChoiceMode()}
      {mode === 'listen-write' && renderListenWriteMode()}
    </div>
  );
};

export default FlashcardStudyMode;

