import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { useReadingTests } from '../../api/hooks';
import api from '../../api/client';

type AnswerValue = string | string[];

type CustomQuestionInput = {
  id: string;
  prompt: string;
  type: string;
  options: string;
  answer: string;
  expectedCount?: number;
  notes?: string;
};

type CustomTestQuestion = {
  question_id: string;
  question_type: string;
  prompt: string;
  options?: string[];
  correct_answer?: string;
  correct_answers?: string[];
  meta?: {
    type: string;
    answerFormat: 'single' | 'multi' | 'multi-select';
    expectedCount?: number;
    instructions?: string;
  };
};

type CustomTest = {
  id: string;
  title: string;
  passage: string;
  questions: CustomTestQuestion[];
};

const QUESTION_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    answerFormat: 'single' | 'multi' | 'multi-select';
    requiresOptions?: boolean;
    presetOptions?: string[];
    placeholder?: string;
    expectsCount?: boolean;
  }
> = {
  'multiple-choice': {
    label: 'Multiple Choice',
    description: 'Choose one correct option (A/B/C/D).',
    answerFormat: 'single',
    requiresOptions: true,
    placeholder: 'Paste options line by line, e.g.\nA. option\nB. option',
  },
  'multiple-select': {
    label: 'Multiple Select',
    description: 'Select more than one option (write correct letters separated by comma).',
    answerFormat: 'multi-select',
    requiresOptions: true,
  },
  'true-false-notgiven': {
    label: 'True / False / Not Given',
    description: 'Standard IELTS statement check.',
    answerFormat: 'single',
    presetOptions: ['True', 'False', 'Not Given'],
  },
  'yes-no-notgiven': {
    label: 'Yes / No / Not Given',
    description: 'Use for matching views/claims.',
    answerFormat: 'single',
    presetOptions: ['Yes', 'No', 'Not Given'],
  },
  'sentence-completion': {
    label: 'Sentence / Note Completion',
    description: 'Fill in one blank with exact words.',
    answerFormat: 'single',
  },
  'summary-completion': {
    label: 'Summary / Table Completion',
    description: 'Multiple blanks. Provide correct answers line by line.',
    answerFormat: 'multi',
    expectsCount: true,
  },
  'matching-headings': {
    label: 'Matching Headings',
    description: 'Match headings to paragraphs. Options are headings list, answers are paragraph-letter pairs.',
    answerFormat: 'multi',
    requiresOptions: true,
    expectsCount: true,
  },
  'matching-information': {
    label: 'Matching Information / Names',
    description: 'Options = information pool, answers = letter/number for each item.',
    answerFormat: 'multi',
    requiresOptions: true,
    expectsCount: true,
  },
  'short-answer': {
    label: 'Short Answer (≤3 words)',
    description: 'Write a short response (max 3 words per IELTS rule).',
    answerFormat: 'single',
  },
};

const ReadingModule = () => {
  const { data, isLoading, isError, error, refetch } = useReadingTests();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [customTest, setCustomTest] = useState<CustomTest | null>(null);
  const [customResults, setCustomResults] = useState<
    | null
    | {
        percentage: number | 'N/A';
        details: Array<{
          id: string;
          expected?: string;
          userAnswer?: string;
          correct: boolean;
          evaluated: boolean;
        }>;
      }
  >(null);
  const [customForm, setCustomForm] = useState({ title: '', passage: '' });
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionInput[]>([
    { id: 'custom-q-1', prompt: '', options: '', answer: '', type: 'multiple-choice', expectedCount: 1 },
  ]);

  const currentTest = useMemo(() => customTest ?? data?.[0] ?? null, [customTest, data]);
  const testId = currentTest ? currentTest.id ?? (currentTest as any)._id ?? (customTest ? customTest.id : null) : null;
  const isCustomTest = Boolean(customTest);

  useEffect(() => {
    setSelectedPassage(null);
    setAnswers({});
  }, [testId]);

  const submission = useMutation({
    mutationFn: async () => {
      const formattedAnswers = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, Array.isArray(value) ? value.join(' || ') : value])
      );
      return api.post('/reading/attempt', {
        test_id: testId,
        time_spent_seconds: 600,
        answers: formattedAnswers,
      });
    },
    onSuccess: (res) => {
      const { percentage, awarded_xp } = res.data;
      toast.success(`Scored ${percentage}% · +${awarded_xp} XP`);
    }
  });

  const highlightMutation = useMutation({
    mutationFn: async (text: string) =>
      api.post('/reading/highlight', { test_id: testId, text }),
    onSuccess: () => toast.success('Added to flashcards!')
  });

  const handleCustomSubmit = () => {
    if (!customTest) return;
    const details = customTest.questions.map((question) => {
      const expectedList =
        question.correct_answers ??
        (question.correct_answer ? [question.correct_answer] : []);
      const normalizedExpected = expectedList.map((ans) => ans.trim().toLowerCase());
      const userValue = answers[question.question_id];
      const userList = Array.isArray(userValue)
        ? userValue
        : typeof userValue === 'string'
          ? userValue.split(/\s*\|\|\s*|,\s*|\n/).filter(Boolean)
          : [];
      const normalizedUser = userList.map((ans) => ans.trim().toLowerCase());

      const evaluated = normalizedExpected.length > 0;
      let correct = false;
      if (evaluated) {
        if (question.meta?.answerFormat === 'multi-select' || question.meta?.answerFormat === 'multi') {
          if (normalizedUser.length === normalizedExpected.length) {
            const sortedUser = [...normalizedUser].sort();
            const sortedExpected = [...normalizedExpected].sort();
            correct = sortedUser.every((ans, idx) => ans === sortedExpected[idx]);
          }
        } else {
          correct = normalizedUser[0] ? normalizedUser[0] === normalizedExpected[0] : false;
        }
      }

      return {
        id: question.question_id,
        expected: evaluated ? expectedList.join(', ') : '— (not provided)',
        userAnswer: userList.join(', '),
        correct,
        evaluated,
      };
    });
    const gradedQuestions = details.filter((item) => item.evaluated);
    const correctCount = gradedQuestions.filter((item) => item.correct).length;
    const percentage =
      gradedQuestions.length > 0 ? Math.round((correctCount / gradedQuestions.length) * 100) : 'N/A';
    setCustomResults({ percentage, details });
    toast.success(
      gradedQuestions.length > 0
        ? `Scored ${percentage}% (local set)`
        : 'Responses saved (no answer key provided)'
    );
  };

  const addQuestionInput = () => {
    setCustomQuestions((prev) => [
      ...prev,
      { id: `custom-q-${prev.length + 1}`, prompt: '', options: '', answer: '', type: 'multiple-choice', expectedCount: 1 },
    ]);
  };

  const handleCreateCustomTest = () => {
    if (!customForm.passage.trim()) {
      toast.error('Please paste the passage first.');
      return;
    }
    const formattedQuestions: CustomTestQuestion[] = customQuestions
      .filter((q) => q.prompt.trim())
      .map((q, index) => {
        const config = QUESTION_TYPE_CONFIG[q.type];
        const options = q.options
          .split('\n')
          .map((opt) => opt.trim())
          .filter(Boolean);
        const answers = q.answer
          .split('\n')
          .map((ans) => ans.trim())
          .filter(Boolean);

        const finalOptions = config?.presetOptions ?? (config?.requiresOptions ? options : undefined);
        const answerFormat = config?.answerFormat ?? (answers.length > 1 ? 'multi' : 'single');
        const expectedCount =
          q.expectedCount && q.expectedCount > 0 ? q.expectedCount : answers.length || undefined;
        return {
          question_id: q.id || `custom-${index}`,
          question_type: q.type,
          prompt: q.prompt.trim(),
          options: finalOptions ?? (options.length > 0 ? options : undefined),
          correct_answer: answers.length === 1 ? answers[0] : undefined,
          correct_answers: answers.length > 1 ? answers : undefined,
          meta: {
            type: q.type,
            answerFormat,
            expectedCount,
            instructions: config?.description,
          },
        };
      });

    if (formattedQuestions.length === 0) {
      toast.error('Please add at least one question.');
      return;
    }

    setCustomTest({
      id: `custom-${Date.now()}`,
      title: customForm.title.trim() || 'Custom reading passage',
      passage: customForm.passage.trim(),
      questions: formattedQuestions,
    });
    setCustomResults(null);
    toast.success('Custom reading set ready!');
  };

  if (isLoading) {
    return <p className="text-slate-400">Loading reading module...</p>;
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không tải được bài đọc.';
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-6 space-y-3">
        <p className="text-red-300 text-sm">{message}</p>
        <button
          type="button"
          className="rounded-full border border-red-400 px-4 py-2 text-sm"
          onClick={() => refetch()}
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-sm text-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-white">No reading set available yet</h2>
          <p>
            Paste your own passage + questions below, or refresh to fetch the official packs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-slate-300 text-xs font-semibold uppercase">Title</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-white"
              placeholder="E.g. Cambridge 16 Test 2"
              value={customForm.title}
              onChange={(event) => setCustomForm((prev) => ({ ...prev, title: event.target.value }))}
            />

            <label className="block text-slate-300 text-xs font-semibold uppercase">Passage</label>
            <textarea
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-3 min-h-[200px] text-white"
              placeholder="Paste the full passage here..."
              value={customForm.passage}
              onChange={(event) => setCustomForm((prev) => ({ ...prev, passage: event.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-xs font-semibold uppercase">Questions</label>
            </div>
            <div className="space-y-4 pr-2">
              {customQuestions.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-slate-800 p-3 space-y-3 bg-slate-900/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Question #{index + 1}</p>
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-900/70 text-xs p-2 text-white flex-1"
                      value={question.type}
                      onChange={(event) =>
                        setCustomQuestions((prev) =>
                          prev.map((item) =>
                            item.id === question.id ? { ...item, type: event.target.value } : item
                          )
                        )
                      }
                    >
                      {Object.entries(QUESTION_TYPE_CONFIG).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-400">{QUESTION_TYPE_CONFIG[question.type]?.description}</p>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-sm"
                    placeholder="Question prompt..."
                    value={question.prompt}
                    onChange={(event) =>
                      setCustomQuestions((prev) =>
                        prev.map((item) => (item.id === question.id ? { ...item, prompt: event.target.value } : item))
                      )
                    }
                  />
                  {(QUESTION_TYPE_CONFIG[question.type]?.requiresOptions ||
                    QUESTION_TYPE_CONFIG[question.type]?.presetOptions) && (
                    <textarea
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm min-h-[140px]"
                      placeholder={
                        QUESTION_TYPE_CONFIG[question.type]?.placeholder ??
                        'Options (one per line). Leave empty to auto-fill).'
                      }
                      value={question.options}
                      onChange={(event) =>
                        setCustomQuestions((prev) =>
                          prev.map((item) => (item.id === question.id ? { ...item, options: event.target.value } : item))
                        )
                      }
                    />
                  )}
                  {QUESTION_TYPE_CONFIG[question.type]?.expectsCount && (
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-sm"
                      placeholder="Number of blanks / matches"
                      value={question.expectedCount ?? ''}
                      onChange={(event) =>
                        setCustomQuestions((prev) =>
                          prev.map((item) =>
                            item.id === question.id ? { ...item, expectedCount: Number(event.target.value) } : item
                          )
                        )
                      }
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Answer key (optional)</span>
                      <span>Use new lines for multiple blanks</span>
                    </div>
                    <textarea
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-sm min-h-[50px]"
                      placeholder="Leave empty if you only want to record user responses."
                      value={question.answer}
                      onChange={(event) =>
                        setCustomQuestions((prev) =>
                          prev.map((item) => (item.id === question.id ? { ...item, answer: event.target.value } : item))
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="w-full rounded-xl border border-dashed border-primary/50 py-2 text-primary text-sm font-semibold hover:bg-primary/10 transition"
                onClick={addQuestionInput}
              >
                + Add question
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-primary px-5 py-2 text-white font-semibold"
            onClick={handleCreateCustomTest}
          >
            Start practicing
          </button>
          <button
            type="button"
            className="rounded-full border border-primary/40 px-4 py-2 text-primary"
            onClick={() => refetch()}
          >
            Refresh reading packs
          </button>
        </div>
      </div>
    );
  }

  const instructions = [
    {
      title: 'Step 1 · Preview',
      detail: 'Read the passage on the left. Drag to highlight any tricky part.',
      icon: '📘'
    },
    {
      title: 'Step 2 · Take notes',
      detail: 'A mini note pad appears once you highlight something. Write a quick summary or vocabulary.',
      icon: '📝'
    },
    {
      title: 'Step 3 · Answer',
      detail: 'Fill in all answers on the right panel. Each question saves immediately.',
      icon: '✅'
    },
    {
      title: 'Step 4 · Submit',
      detail: 'Hit “Submit answers” to get the score, XP boost, and review suggestions.',
      icon: '🚀'
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-4 gap-4">
        {instructions.map((step) => (
          <div
            key={step.title}
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-200 flex gap-3"
          >
            <span className="text-xl">{step.icon}</span>
            <div>
              <p className="font-semibold text-white">{step.title}</p>
              <p className="text-slate-300 text-sm">{step.detail}</p>
            </div>
          </div>
        ))}
      </section>

    <div className="grid lg:grid-cols-2 gap-6">
      <section className="space-y-4">
        <div
          className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50 prose prose-invert max-w-none"
          onMouseUp={() => {
            if (isCustomTest) return;
            const text = window.getSelection()?.toString();
            if (text && text.length > 5 && testId) {
              highlightMutation.mutate(text);
              setSelectedPassage(text);
            }
          }}
        >
          <h2 className="text-2xl font-semibold mb-4">{currentTest.title}</h2>
          <p>{currentTest.passage}</p>
        </div>
        {selectedPassage && (
          <textarea
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm"
            placeholder={isCustomTest ? 'Quick notes (not saved in custom mode)...' : 'Write a quick note (press outside to save)...'}
            onBlur={(event) => {
              if (isCustomTest) return;
              event.target.value &&
                api.post('/reading/notes', {
                  test_id: testId,
                  block_type: 'text',
                  block_content: event.target.value
                });
            }}
          />
        )}
      </section>

      <section className="space-y-4">
        {currentTest.questions.map((question) => (
          <div key={question.question_id} className="border border-slate-800 rounded-2xl p-4">
            <p className="text-sm text-primary mb-1 uppercase">{question.question_type}</p>
            <p className="font-semibold mb-3">{question.prompt}</p>
            {(() => {
              const answerFormat = question.meta?.answerFormat ?? (question.options ? 'single' : 'single');
              const optionList = question.options;

              if (answerFormat === 'multi-select' && optionList) {
                const currentValue = answers[question.question_id];
                const selectedOptions = Array.isArray(currentValue) ? currentValue : [];
                return (
                  <div className="space-y-2">
                    {optionList.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name={`${question.question_id}-${option}`}
                          value={option}
                          checked={selectedOptions.includes(option)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setAnswers((prev) => {
                              const existing = Array.isArray(prev[question.question_id])
                                ? (prev[question.question_id] as string[])
                                : [];
                              const next = checked
                                ? [...existing, option]
                                : existing.filter((item) => item !== option);
                              return { ...prev, [question.question_id]: next };
                            });
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                );
              }

              if (optionList) {
                return (
                  <div className="space-y-2">
                    {optionList.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={question.question_id}
                          value={option}
                          checked={answers[question.question_id] === option}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.question_id]: option }))
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                );
              }

              if (answerFormat === 'multi') {
                const expectedCount =
                  question.meta?.expectedCount ?? question.correct_answers?.length ?? 2;
                const currentValues = Array.isArray(answers[question.question_id])
                  ? (answers[question.question_id] as string[])
                  : Array(expectedCount).fill('');
                return (
                  <div className="space-y-2">
                    {Array.from({ length: expectedCount }).map((_, idx) => (
                      <input
                        key={`${question.question_id}-blank-${idx}`}
                        type="text"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-sm"
                        placeholder={`Blank ${idx + 1}`}
                        value={currentValues[idx] ?? ''}
                        onChange={(event) =>
                          setAnswers((prev) => {
                            const existing = Array.isArray(prev[question.question_id])
                              ? [...(prev[question.question_id] as string[])]
                              : Array(expectedCount).fill('');
                            existing[idx] = event.target.value;
                            return { ...prev, [question.question_id]: existing };
                          })
                        }
                      />
                    ))}
                  </div>
                );
              }

              return (
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-sm"
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.question_id]: event.target.value }))
                  }
                />
              );
            })()}
          </div>
        ))}

        <div className="space-y-3">
          <button
            className="w-full rounded-full bg-primary py-3 font-semibold disabled:opacity-40"
            disabled={!currentTest?.questions?.length}
            onClick={() => (isCustomTest ? handleCustomSubmit() : submission.mutate())}
          >
            Submit answers
          </button>
          {isCustomTest && customResults && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-200 space-y-2">
              <p className="font-semibold text-white">Local evaluation</p>
              <p>
                Score:{' '}
                {typeof customResults.percentage === 'number'
                  ? `${customResults.percentage}%`
                  : 'N/A (answer key missing)'}
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customResults.details.map((detail, index) => (
                  <div key={detail.id} className="rounded-xl border border-slate-800 p-2">
                    <p className="text-xs text-slate-400 uppercase mb-1">Question #{index + 1}</p>
                    <p className="text-sm">
                      <span className="text-slate-400">Your answer:</span> {detail.userAnswer || '—'}
                    </p>
                    <p className="text-sm">
                      <span className="text-slate-400">Correct:</span> {detail.expected || 'N/A'}
                    </p>
                    <p className={`text-xs font-semibold ${detail.evaluated ? (detail.correct ? 'text-green-400' : 'text-red-400') : 'text-slate-400'}`}>
                      {detail.evaluated ? (detail.correct ? 'Correct' : 'Incorrect') : 'Not graded (no answer key)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};

export default ReadingModule;

