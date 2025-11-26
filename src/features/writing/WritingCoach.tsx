import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import api from '../../api/client';
import { useVocabDecks, useCreateDeckMutation } from '../../api/hooks';
import { addDeckWord } from '../../api/vocabulary';

interface WritingPrompt {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  task_type: string;
}

interface ImprovedChange {
  original: string;
  improved: string;
  type: string; // "sentence" or "word"
  reason?: string;
}

interface WritingFeedback {
  grammar: number;
  lexical: number;
  coherence: number;
  task: number;
  overall_band: number;
  feedback: string;
  improved_version?: string;
  improved_changes?: ImprovedChange[];
  suggestions?: string[];
  citations?: string[];
  grammar_errors?: string[];
  lexical_suggestions?: Array<{ word: string; suggestion: string; reason: string }>;
  weak_sentences?: Array<{ original: string; improved: string; reason: string }>;
}

// Helper function to clean prompt description (remove JSON formatting)
const cleanPromptDescription = (desc: string): string => {
  if (!desc) return '';
  
  let cleaned = desc.trim();
  
  // Remove markdown code blocks (multiline)
  cleaned = cleaned.replace(/^```json\s*/gm, '');
  cleaned = cleaned.replace(/^```\s*/gm, '');
  cleaned = cleaned.replace(/```\s*$/gm, '');
  cleaned = cleaned.trim();
  
  // Remove backticks
  cleaned = cleaned.replace(/`/g, '');
  
  // Try to parse as JSON if it looks like JSON
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleaned);
      // If it's an object with description field, extract it
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        if (parsed.description && typeof parsed.description === 'string') {
          return parsed.description.trim();
        }
        // If it has a title and description, combine them
        if (parsed.title && parsed.description) {
          return `${parsed.title}\n\n${parsed.description}`.trim();
        }
      }
      // If it's a string value, return it
      if (typeof parsed === 'string') {
        return parsed.trim();
      }
    } catch (e) {
      // Not valid JSON, continue with original
    }
  }
  
  return cleaned;
};

const WritingCoach = () => {
  const [essay, setEssay] = useState('');
  const [targetBand, setTargetBand] = useState<number | ''>('');
  const [result, setResult] = useState<WritingFeedback | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; suggestion: string; reason: string } | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<{ 
    word: string; 
    type: string; 
    reason?: string;
    original?: string; // For grammar errors: the incorrect sentence
    improved?: string; // For grammar errors: the correct sentence
  } | null>(null);
  
  // Vocabulary hooks
  const { data: decks = [], refetch: refetchDecks } = useVocabDecks();
  
  // Helper function to find appropriate deck based on correction type
  const findSuggestedDeck = (type: string): string | null => {
    const typeLower = type.toLowerCase();
    const deckNames = decks.map(d => d.name.toLowerCase());
    
    // Try to find matching deck
    if (typeLower === 'vocabulary' || typeLower === 'word') {
      const vocabDeck = decks.find(d => 
        d.name.toLowerCase().includes('vocab') || 
        d.name.toLowerCase().includes('word') ||
        d.name.toLowerCase().includes('vocabulary')
      );
      return vocabDeck ? (vocabDeck._id ?? vocabDeck.id ?? null) : null;
    }
    
    if (typeLower === 'grammar') {
      const grammarDeck = decks.find(d => 
        d.name.toLowerCase().includes('grammar') || 
        d.name.toLowerCase().includes('grammar error')
      );
      return grammarDeck ? (grammarDeck._id ?? grammarDeck.id ?? null) : null;
    }
    
    if (typeLower === 'spelling') {
      const spellingDeck = decks.find(d => 
        d.name.toLowerCase().includes('spelling') || 
        d.name.toLowerCase().includes('spell')
      );
      return spellingDeck ? (spellingDeck._id ?? spellingDeck.id ?? null) : null;
    }
    
    // Default: return first deck or null
    return decks.length > 0 ? (decks[0]._id ?? decks[0].id ?? null) : null;
  };

  // Generate new prompt
  const generatePromptMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/writing/generate-prompt?task_type=${taskType}`);
      return data as WritingPrompt;
    },
    onSuccess: (prompt) => {
      // Clean description before setting
      const cleanedPrompt: WritingPrompt = {
        ...prompt,
        description: cleanPromptDescription(prompt.description),
        title: prompt.title ? cleanPromptDescription(prompt.title) : 'IELTS Writing Task',
      };
      setCurrentPrompt(cleanedPrompt);
      setEssay(''); // Clear previous essay
      setResult(null); // Clear previous results
      toast.success('New prompt generated!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to generate prompt. Please try again.');
    },
  });

  // Submit essay for analysis
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!currentPrompt) {
        throw new Error('Please start the test before submitting');
      }
      const { data } = await api.post('/writing/submit', {
        task_type: taskType,
        content: essay,
        prompt_content: currentPrompt.description,
        target_band: targetBand ? Number(targetBand) : null,
      });
      return data as WritingFeedback;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Band score: ${data.overall_band.toFixed(1)}`);
      if (targetBand && data.overall_band < Number(targetBand)) {
        toast(`Need to improve ${(Number(targetBand) - data.overall_band).toFixed(1)} points to reach target`, {
          icon: '📈',
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'An error occurred during analysis');
    }
  });

  return (
    <div className="space-y-6">
      {/* Task Type Selection & Start Button */}
      {!currentPrompt && (
        <div className="rounded-3xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Start Writing Test</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Select Test Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTaskType('task1')}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    taskType === 'task1'
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Task 1 (Report)
                </button>
                <button
                  onClick={() => setTaskType('task2')}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    taskType === 'task2'
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Task 2 (Essay)
                </button>
              </div>
            </div>
            <button
              className="w-full rounded-full bg-primary py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={() => generatePromptMutation.mutate()}
              disabled={generatePromptMutation.isPending}
            >
              {generatePromptMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating prompt...</span>
                </>
              ) : (
                <>
                  <span>🎯 Start Test</span>
                </>
              )}
            </button>      
          </div>
        </div>
      )}

      {/* Prompt Section */}
      {currentPrompt && (
        <div className="rounded-3xl border border-slate-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Writing Prompt</h2>
              <p className="text-sm text-slate-400 uppercase mt-1">{currentPrompt.task_type}</p>
            </div>
            <button
              onClick={() => {
                setCurrentPrompt(null);
                setEssay('');
                setResult(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-700"
            >
              New Prompt
            </button>
          </div>
          <p className="font-medium mt-2 text-lg">{currentPrompt.title}</p>
          <p className="text-slate-300 mt-3 leading-relaxed whitespace-pre-wrap">
            {cleanPromptDescription(currentPrompt.description)}
          </p>
        </div>
      )}

      {/* Target Band Input */}
      {currentPrompt && (
        <div className="rounded-3xl border border-slate-800 p-6">
          <label className="block text-sm font-semibold mb-2">
            Target Band Score (Optional)
          </label>
          <input
            type="number"
            min="0"
            max="9"
            step="0.5"
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
            placeholder="e.g., 7.0, 7.5, 8.0..."
            value={targetBand}
            onChange={(e) => {
              const val = e.target.value;
              setTargetBand(val === '' ? '' : Math.max(0, Math.min(9, Number(val))));
            }}
          />
          <p className="text-xs text-slate-500 mt-2">
            Enter your target band score. The system will provide specific suggestions to reach your goal.
          </p>
        </div>
      )}

      {/* Essay Input */}
      {currentPrompt && (
        <textarea
          className="w-full min-h-[280px] rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm"
          placeholder="Write your essay here..."
          value={essay}
          onChange={(event) => setEssay(event.target.value)}
          disabled={submitMutation.isPending}
        />
      )}

      {/* Submit Button */}
      {currentPrompt && (
        <button
          className="w-full rounded-full bg-primary py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={() => {
            if (!essay.trim()) {
              toast.error('Please enter your essay before analysis');
              return;
            }
            submitMutation.mutate();
          }}
          disabled={submitMutation.isPending || !essay.trim()}
        >
          {submitMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing essay... (usually takes 5-15 seconds)</span>
            </>
          ) : (
            'Analyze & Score'
          )}
        </button>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Band Scores */}
          <div className="rounded-3xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Band Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase mb-1">Grammar</p>
                <p className="text-2xl font-bold text-primary">{result.grammar.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase mb-1">Lexical</p>
                <p className="text-2xl font-bold text-primary">{result.lexical.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase mb-1">Coherence</p>
                <p className="text-2xl font-bold text-primary">{result.coherence.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase mb-1">Task</p>
                <p className="text-2xl font-bold text-primary">{result.task.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase mb-1">Overall</p>
                <p className="text-3xl font-bold text-primary">{result.overall_band.toFixed(1)}</p>
              </div>
            </div>
            {targetBand && result.overall_band < Number(targetBand) && (
              <div className="mt-4 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Need to improve <strong>{(Number(targetBand) - result.overall_band).toFixed(1)}</strong> points to reach target {targetBand}
                </p>
              </div>
            )}
          </div>

          {/* Citations - Well-written parts */}
          {result.citations && result.citations.length > 0 && (
            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-400">
                ✨ Well-Written Parts
              </h3>
              <div className="space-y-2">
                {result.citations.map((citation, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-green-500/20">
                    <p className="text-sm text-slate-200 italic">"{citation}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Sentences - Cần cải thiện */}
          {result.weak_sentences && result.weak_sentences.length > 0 && (
            <div className="rounded-3xl border border-orange-500/30 bg-orange-500/10 p-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-400">
                🔧 Sentences to Improve
              </h3>
              <div className="space-y-4">
                {result.weak_sentences.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-orange-500/20 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current sentence:</p>
                      <p className="text-sm text-slate-300 line-through">"{item.original}"</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Improved version:</p>
                      <p className="text-sm text-orange-300 font-medium">"{item.improved}"</p>
                    </div>
                    {item.reason && (
                      <p className="text-xs text-slate-400 italic mt-1">💡 {item.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Errors */}
          {result.grammar_errors && result.grammar_errors.length > 0 && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
              <h3 className="text-lg font-semibold mb-3 text-red-400">
                ❌ Grammar Errors
              </h3>
              <div className="space-y-2">
                {result.grammar_errors.map((error, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-red-500/20">
                    <p className="text-sm text-slate-200">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lexical Suggestions */}
          {result.lexical_suggestions && result.lexical_suggestions.length > 0 && (
            <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">
                💡 Better Vocabulary Suggestions
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Click "Add to Vocabulary" to save suggested words to your vocabulary deck
              </p>
              <div className="space-y-3">
                {result.lexical_suggestions.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-blue-500/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="text-slate-400 line-through">{item.word}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-blue-400 font-semibold">{item.suggestion}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedWord(item);
                          setShowDeckModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 transition-colors whitespace-nowrap"
                      >
                        + Add to Vocabulary
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="rounded-3xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-3">📝 Improvement Suggestions</h3>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General Feedback */}
          <div className="rounded-3xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold mb-3">📋 Overall Feedback</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{result.feedback}</p>
          </div>

          {/* Improved Version with Diff */}
          {result.improved_version && (
            <div className="rounded-3xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-3">✨ Improved Version</h3>
              
              {/* Show changes if available */}
              {result.improved_changes && result.improved_changes.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary of corrections */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong>Corrections Summary:</strong>
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      {(() => {
                        const spellingCount = result.improved_changes.filter(c => c.type === 'spelling').length;
                        const grammarCount = result.improved_changes.filter(c => c.type === 'grammar').length;
                        const vocabCount = result.improved_changes.filter(c => c.type === 'word').length;
                        const sentenceCount = result.improved_changes.filter(c => c.type === 'sentence').length;
                        
                        return (
                          <>
                            {spellingCount > 0 && (
                              <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">
                                🔴 {spellingCount} spelling {spellingCount === 1 ? 'error' : 'errors'}
                              </span>
                            )}
                            {grammarCount > 0 && (
                              <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-300">
                                🟠 {grammarCount} grammar {grammarCount === 1 ? 'error' : 'errors'}
                              </span>
                            )}
                            {vocabCount > 0 && (
                              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                💡 {vocabCount} vocabulary {vocabCount === 1 ? 'improvement' : 'improvements'}
                              </span>
                            )}
                            {sentenceCount > 0 && (
                              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                📝 {sentenceCount} sentence {sentenceCount === 1 ? 'improvement' : 'improvements'}
                              </span>
                            )}
                            <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                              Total: {result.improved_changes.length} {result.improved_changes.length === 1 ? 'change' : 'changes'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Sort: spelling and grammar errors first, then others */}
                  {[...result.improved_changes]
                    .sort((a, b) => {
                      const priority = { spelling: 0, grammar: 1, word: 2, sentence: 3 };
                      return (priority[a.type as keyof typeof priority] ?? 99) - 
                             (priority[b.type as keyof typeof priority] ?? 99);
                    })
                    .map((change, idx) => {
                      // Determine colors based on error type
                      const isSpelling = change.type === 'spelling';
                      const isGrammar = change.type === 'grammar';
                      const isError = isSpelling || isGrammar;
                      
                      const originalColor = isSpelling 
                        ? 'bg-red-500/30 text-red-200 border border-red-500/50'
                        : isGrammar
                        ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                        : 'bg-red-500/20 text-red-300';
                      
                      const improvedColor = isError
                        ? 'bg-green-500/30 text-green-200 border border-green-500/50'
                        : 'bg-green-500/20 text-green-300';
                      
                      const typeBadge = isSpelling 
                        ? { text: '🔴 Spelling Error', desc: 'Single word spelling correction' }
                        : isGrammar
                        ? { text: '🟠 Grammar Error', desc: 'Grammar error affecting sentence structure' }
                        : change.type === 'word'
                        ? { text: '💡 Vocabulary', desc: 'Word-level correction (1-3 words): punctuation, plural forms, word choice' }
                        : { text: '📝 Sentence', desc: 'Sentence-level correction: punctuation affecting sentence structure, sentence restructuring' };
                      
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              isSpelling ? 'bg-red-500/20 text-red-300' :
                              isGrammar ? 'bg-orange-500/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`} title={typeBadge.desc}>
                              {typeBadge.text}
                            </span>
                            <span className="text-xs text-slate-500 italic">
                              {typeBadge.desc}
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 mb-1 uppercase">Original (with error)</p>
                              <p className="text-sm text-slate-300 leading-relaxed">
                                <span className={`px-2 py-1 rounded ${originalColor}`}>
                                  {change.original}
                                </span>
                              </p>
                            </div>
                            <div className="text-slate-600 text-xl mt-5">→</div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 mb-1 uppercase">Corrected</p>
                              <p className="text-sm text-slate-300 leading-relaxed">
                                <span className={`px-2 py-1 rounded ${improvedColor}`}>
                                  {change.improved}
                                </span>
                              </p>
                            </div>
                          </div>
                          {change.reason && (
                            <p className="text-xs text-slate-400 italic mt-2">
                              💡 {change.reason}
                            </p>
                          )}
                          
                          {/* Add to Vocabulary/Grammar Deck button */}
                          {(change.type === 'vocabulary' || change.type === 'word' || change.type === 'grammar') && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <button
                                onClick={() => {
                                  // For grammar errors, save both original (error) and improved (correct) versions
                                  // For vocabulary, save the improved word/phrase
                                  let wordToAdd: string;
                                  let reasonText: string;
                                  
                                  if (change.type === 'grammar') {
                                    // For grammar: save the incorrect sentence as "word" so user knows what to avoid
                                    wordToAdd = change.original; // The incorrect sentence
                                    reasonText = change.reason || 'Grammar error fixed';
                                  } else {
                                    // For vocabulary: save the improved word/phrase
                                    wordToAdd = change.improved.split(' ').slice(0, 3).join(' '); // Take first 1-3 words
                                    reasonText = change.reason || 'Vocabulary improvement from writing analysis';
                                  }
                                  
                                  setSelectedCorrection({
                                    word: wordToAdd,
                                    type: change.type,
                                    reason: reasonText,
                                    original: change.type === 'grammar' ? change.original : undefined,
                                    improved: change.type === 'grammar' ? change.improved : undefined,
                                  });
                                  setShowDeckModal(true);
                                }}
                                className={`w-full px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                                  change.type === 'grammar'
                                    ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30 hover:border-orange-500/50'
                                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30 hover:border-blue-500/50'
                                }`}
                              >
                                <span>{change.type === 'grammar' ? '📝' : '📚'}</span>
                                <span>{change.type === 'grammar' ? 'Save Grammar Error' : 'Add to Vocabulary'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  {/* Full improved text */}
                  <div className="mt-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-2 uppercase">Full Improved Essay</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {result.improved_version}
                    </p>
                  </div>
                </div>
              ) : (
                /* Fallback: show full text if no changes available */
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {result.improved_version}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deck Selection Modal for Lexical Suggestions */}
      {showDeckModal && selectedWord && !selectedCorrection && (
        <DeckSelectionModal
          decks={decks}
          word={selectedWord.suggestion}
          reason={selectedWord.reason}
          suggestedDeckId={findSuggestedDeck('vocabulary')}
          onDeckCreated={refetchDecks}
          onClose={() => {
            setShowDeckModal(false);
            setSelectedWord(null);
          }}
        />
      )}
      
      {/* Deck Selection Modal for Corrections */}
      {showDeckModal && selectedCorrection && (
        <DeckSelectionModal
          decks={decks}
          word={selectedCorrection.word}
          reason={selectedCorrection.reason || 'Vocabulary improvement from writing analysis'}
          suggestedDeckId={findSuggestedDeck(selectedCorrection.type)}
          correctionType={selectedCorrection.type}
          original={selectedCorrection.original}
          improved={selectedCorrection.improved}
          onDeckCreated={refetchDecks}
          onClose={() => {
            setShowDeckModal(false);
            setSelectedCorrection(null);
          }}
        />
      )}
    </div>
  );
};

// Deck Selection Modal Component
interface DeckSelectionModalProps {
  decks: Array<{ _id?: string; id?: string; name: string }>;
  word: string;
  reason: string;
  suggestedDeckId?: string | null;
  correctionType?: string;
  original?: string; // For grammar: incorrect sentence
  improved?: string; // For grammar: correct sentence
  onDeckCreated?: () => void;
  onClose: () => void;
}

const DeckSelectionModal = ({ decks, word, reason, suggestedDeckId, correctionType, original, improved, onDeckCreated, onClose }: DeckSelectionModalProps) => {
  const isGrammar = correctionType === 'grammar';
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    suggestedDeckId || (decks.length > 0 ? (decks[0]._id ?? decks[0].id ?? null) : null)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  
  const createDeckMutation = useCreateDeckMutation();

  const addWordMutation = useMutation({
    mutationFn: async (deckId: string) => {
      // For grammar errors: save incorrect sentence as "word" and correct sentence as "definition"
      // This way users can see what to avoid and what to use instead
      if (isGrammar && original && improved) {
        return await addDeckWord(deckId, {
          word: original, // The incorrect sentence - so user knows what to avoid
          definition: improved, // The correct sentence - so user knows what to use
          part_of_speech: 'phrase',
          notes: reason || 'Grammar error correction from writing analysis',
          explanation: `Incorrect: ${original}\n\nCorrect: ${improved}\n\nReason: ${reason || 'Grammar error fixed'}`,
          example: improved, // Use correct sentence as example
          tags: ['grammar-error', 'writing-correction', 'ielts'],
        });
      } else {
        // For vocabulary: save normally
        return await addDeckWord(deckId, {
          word: word,
          definition: reason || `Better alternative vocabulary word`,
          part_of_speech: 'noun', // Default, can be improved later
          notes: `Suggested from writing analysis`,
          tags: ['writing-suggestion', 'ielts'],
        });
      }
    },
    onSuccess: () => {
      toast.success(`Added "${word}" to vocabulary!`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to add word');
    },
  });

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    try {
      const newDeck = await createDeckMutation.mutateAsync({
        name: newDeckName.trim(),
        description: `Deck for ${word} and similar words`,
        is_public: false,
      });
      setSelectedDeckId(newDeck._id ?? newDeck.id ?? null);
      setShowCreateDeck(false);
      setNewDeckName('');
      toast.success(`Created deck "${newDeck.name}"`);
      // Refetch decks to update the list
      if (onDeckCreated) {
        onDeckCreated();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create deck');
    }
  };

  const handleAddWord = async () => {
    if (!selectedDeckId) {
      toast.error('Please select a deck');
      return;
    }

    setIsAdding(true);
    try {
      await addWordMutation.mutateAsync(selectedDeckId);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-200">
            {isGrammar ? 'Save Grammar Error' : 'Add to Vocabulary'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className={`mb-4 p-3 rounded-xl border ${
          isGrammar 
            ? 'bg-orange-500/10 border-orange-500/20' 
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          {isGrammar && original && improved ? (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-400 font-semibold mb-1">❌ Incorrect (Avoid this):</p>
                <p className="text-sm text-red-300 line-through">{original}</p>
              </div>
              <div>
                <p className="text-xs text-green-400 font-semibold mb-1">✅ Correct (Use this):</p>
                <p className="text-sm text-green-300">{improved}</p>
              </div>
              {reason && (
                <p className="text-xs text-slate-400 mt-2 italic">💡 {reason}</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-300 mb-1">
                <span className={`font-semibold ${isGrammar ? 'text-orange-400' : 'text-blue-400'}`}>
                  {isGrammar ? 'Grammar Error:' : 'Word:'}
                </span> {word}
              </p>
              {reason && (
                <p className="text-xs text-slate-400 mt-1">{reason}</p>
              )}
            </>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {isGrammar ? 'Select Grammar Deck:' : 'Select Vocabulary Deck:'}
          </label>
          {suggestedDeckId && (
            <div className="mb-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-green-400">
                💡 Suggested deck based on correction type
              </p>
            </div>
          )}
          {decks.length === 0 ? (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-3">
              <p className="text-sm text-yellow-400 mb-2">
                No decks available. Create a new deck below.
              </p>
            </div>
          ) : (
            <>
              <select
                value={selectedDeckId || ''}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                {decks.map((deck) => {
                  const deckId = deck._id ?? deck.id;
                  const isSuggested = suggestedDeckId === deckId;
                  return (
                    <option key={deckId} value={deckId}>
                      {deck.name}{isSuggested ? ' (Suggested)' : ''}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={() => setShowCreateDeck(!showCreateDeck)}
                className="w-full text-xs text-blue-400 hover:text-blue-300 underline"
              >
                {showCreateDeck ? 'Cancel' : '+ Create New Deck'}
              </button>
            </>
          )}
          
          {showCreateDeck && (
            <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter deck name (e.g., Vocabulary, Grammar Errors)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateDeck();
                  }
                }}
              />
              <button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim() || createDeckMutation.isPending}
                className="w-full px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddWord}
            disabled={!selectedDeckId || isAdding}
            className={`flex-1 px-4 py-2 rounded-xl disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors ${
              isGrammar
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isAdding ? 'Adding...' : isGrammar ? 'Save to Deck' : 'Add to Deck'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingCoach;
