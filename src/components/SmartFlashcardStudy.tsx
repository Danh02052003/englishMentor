import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import api from '../api/client';
import TTSButton from './TTSButton';
import type { Flashcard, VocabularyWord } from '../api/types';

type StudyMode = 'flashcard' | 'fill-blank' | 'multiple-choice' | 'listen-write';

interface StudyQueueItem {
  word: VocabularyWord;
  card?: Flashcard;
  grade?: number; // Đánh giá từ flashcard mode
  modesCompleted: Set<StudyMode>; // Các chế độ đã hoàn thành
}

interface Props {
  words: VocabularyWord[];
  flashcards?: Flashcard[];
  onComplete?: () => void;
}

const SmartFlashcardStudy = ({ words, flashcards = [], onComplete }: Props) => {
  // Queue các từ cần ôn tập
  const [studyQueue, setStudyQueue] = useState<StudyQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcard');
  
  // State cho từng mode
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // Khởi tạo queue từ words
  useEffect(() => {
    if (words.length > 0) {
      const initialQueue: StudyQueueItem[] = words.map((word) => {
        const card = flashcards.find(
          (c) => (c._id ?? c.id) === (word._id ?? word.id)
        );
        return {
          word,
          card,
          modesCompleted: new Set<StudyMode>(),
        };
      });
      setStudyQueue(initialQueue);
      setCurrentIndex(0);
      setCurrentMode('flashcard');
    }
  }, [words, flashcards]);

  const currentItem = studyQueue[currentIndex];
  const currentWord = currentItem?.word;
  const currentCard = currentItem?.card;

  // Reset state khi chuyển từ hoặc mode
  useEffect(() => {
    setIsFlipped(false);
    setUserAnswer('');
    setShowAnswer(false);
    setSelectedChoice(null);
  }, [currentIndex, currentMode]);

  // Xác định mode tiếp theo dựa trên logic thông minh
  const getNextMode = (item: StudyQueueItem): StudyMode | null => {
    const completed = item.modesCompleted;
    
    // Nếu chưa đánh giá (chưa có grade), bắt đầu với flashcard
    if (!item.grade && !completed.has('flashcard')) {
      return 'flashcard';
    }
    
    // Nếu đã đánh giá, luân phiên các chế độ khác
    const remainingModes = (['fill-blank', 'multiple-choice', 'listen-write'] as StudyMode[]).filter(
      (mode) => !completed.has(mode)
    );
    
    if (remainingModes.length === 0) {
      return null; // Đã hoàn thành tất cả chế độ
    }
    
    // Luân phiên: ưu tiên chế độ chưa làm
    return remainingModes[0];
  };

  const reviewMutation = useMutation({
    mutationFn: async (grade: number) => {
      if (currentCard) {
        return api.post('/vocabulary/review', { 
          card_id: currentCard._id ?? currentCard.id, 
          grade 
        });
      }
      return Promise.resolve({});
    },
    onSuccess: () => {
      toast.success('Đã ghi nhận đánh giá');
    }
  });

  const handleGrade = (grade: number) => {
    if (!currentItem) return;
    
    // Lưu đánh giá và đánh dấu flashcard đã hoàn thành
    setStudyQueue((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        grade,
        modesCompleted: new Set([...updated[currentIndex].modesCompleted, 'flashcard']),
      };
      return updated;
    });

    if (currentCard) {
      reviewMutation.mutate(grade);
    }
    
    // Chuyển sang chế độ tiếp theo
    moveToNext();
  };

  const handleCompleteMode = () => {
    if (!currentItem) return;
    
    // Đánh dấu mode hiện tại đã hoàn thành
    setStudyQueue((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        modesCompleted: new Set([...updated[currentIndex].modesCompleted, currentMode]),
      };
      return updated;
    });
    
    moveToNext();
  };

  const moveToNext = () => {
    if (!currentItem) return;
    
    const nextMode = getNextMode({
      ...currentItem,
      modesCompleted: new Set([...currentItem.modesCompleted, currentMode]),
    });
    
    if (nextMode) {
      // Còn mode chưa làm, chuyển sang mode đó
      setCurrentMode(nextMode);
    } else {
      // Đã hoàn thành tất cả mode của từ này, chuyển sang từ tiếp theo
      if (currentIndex < studyQueue.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentMode('flashcard'); // Bắt đầu lại với flashcard cho từ mới
      } else {
        // Đã hoàn thành tất cả
        toast.success('🎉 Đã hoàn thành tất cả từ!');
        onComplete?.();
      }
    }
  };

  const handleSkip = () => {
    moveToNext();
  };

  // Generate multiple choice options
  const getMultipleChoiceOptions = () => {
    if (!currentWord) return [];
    const otherWords = words.filter((w) => (w._id ?? w.id) !== (currentWord._id ?? currentWord.id));
    const distractors = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.word);
    const choices = [currentWord.word, ...distractors].sort(() => Math.random() - 0.5);
    return choices.length === 4 ? choices : [currentWord.word, 'example', 'another', 'different'];
  };

  const choices = useMemo(() => getMultipleChoiceOptions(), [currentWord]);

  // Extract blank from example sentence
  const exampleWithBlank = currentWord?.example
    ? currentWord.example.replace(new RegExp(currentWord.word, 'gi'), '______')
    : '';

  if (!currentWord) {
    return <p className="text-slate-400">Đang tải...</p>;
  }

  // Render Flashcard Mode (có đánh giá độ khó)
  const renderFlashcardMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6 min-h-[400px] flex flex-col justify-center">
      {!isFlipped ? (
        <>
          <div className="text-center space-y-4">
            <p className="text-xs uppercase text-slate-500">Từ vựng</p>
            <p className="text-4xl font-bold">{currentWord.word}</p>
            {currentWord.phonetic && <p className="text-lg text-slate-400">[{currentWord.phonetic}]</p>}
            {currentWord.part_of_speech && (
              <p className="text-sm text-primary uppercase">{currentWord.part_of_speech}</p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <TTSButton text={currentWord.word} disabled={false} />
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
              <p className="text-xl text-slate-200">{currentWord.definition}</p>
            </div>
            {currentWord.explanation && (
              <div>
                <p className="text-xs uppercase text-slate-500">Giải thích</p>
                <p className="text-base text-slate-300">{currentWord.explanation}</p>
              </div>
            )}
            {currentWord.example && (
              <div>
                <p className="text-xs uppercase text-slate-500">Ví dụ</p>
                <p className="text-base text-slate-300 italic">"{currentWord.example}"</p>
              </div>
            )}
            {currentWord.notes && (
              <div>
                <p className="text-xs uppercase text-slate-500">Ghi chú</p>
                <p className="text-sm text-slate-400">{currentWord.notes}</p>
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
              onClick={handleSkip}
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

  // Render Fill Blank Mode (không có đánh giá, chỉ tiếp tục)
  const renderFillBlankMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase text-slate-500">Định nghĩa</p>
          <p className="text-xl text-slate-200">{currentWord.definition}</p>
        </div>
        {currentWord.example && (
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
            <p className="text-primary font-semibold">{currentWord.word}</p>
          </div>
        )}
        <button
          onClick={handleCompleteMode}
          className="rounded-full bg-primary px-6 py-3 font-semibold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  // Render Multiple Choice Mode (không có đánh giá, chỉ tiếp tục)
  const renderMultipleChoiceMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div>
        <p className="text-xs uppercase text-slate-500 mb-2">Định nghĩa</p>
        <p className="text-xl text-slate-200">{currentWord.definition}</p>
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
                ? choice === currentWord.word
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
          <p className="text-primary font-semibold">Đáp án: {currentWord.word}</p>
        </div>
      )}
      {showAnswer && (
        <button
          onClick={handleCompleteMode}
          className="w-full rounded-full bg-primary px-6 py-3 font-semibold"
        >
          Tiếp tục
        </button>
      )}
    </div>
  );

  // Render Listen Write Mode (không có đánh giá, chỉ tiếp tục)
  const renderListenWriteMode = () => (
    <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 space-y-6">
      <div className="text-center space-y-4">
        <TTSButton text={currentWord.word} disabled={false} />
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
            <p className="text-primary font-semibold">{currentWord.word}</p>
          </div>
        )}
        <button
          onClick={handleCompleteMode}
          className="rounded-full bg-primary px-6 py-3 font-semibold"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const modeLabels: Record<StudyMode, string> = {
    'flashcard': 'Flashcard',
    'fill-blank': 'Điền chỗ trống',
    'multiple-choice': 'Trắc nghiệm',
    'listen-write': 'Nghe & Viết',
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <div>
          Từ {currentIndex + 1} / {studyQueue.length}
        </div>
        <div className="flex gap-2">
          {(['flashcard', 'fill-blank', 'multiple-choice', 'listen-write'] as StudyMode[]).map((m) => (
            <div
              key={m}
              className={`px-3 py-1 rounded-full text-xs ${
                currentMode === m
                  ? 'bg-primary text-white'
                  : currentItem?.modesCompleted.has(m)
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {modeLabels[m]}
            </div>
          ))}
        </div>
      </div>

      {/* Current mode display */}
      {currentMode === 'flashcard' && renderFlashcardMode()}
      {currentMode === 'fill-blank' && renderFillBlankMode()}
      {currentMode === 'multiple-choice' && renderMultipleChoiceMode()}
      {currentMode === 'listen-write' && renderListenWriteMode()}
    </div>
  );
};

export default SmartFlashcardStudy;



