import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { bulkAddWords } from '../api/vocabulary';

interface Props {
  deckId: string;
  onSuccess?: () => void;
}

interface ParsedWord {
  word: string;
  definition: string;
  phonetic?: string;
  part_of_speech?: string;
  example?: string;
  notes?: string;
  explanation?: string;
  tags?: string[];
}

const BulkWordImport = ({ deckId, onSuccess }: Props) => {
  const [bulkText, setBulkText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const parseBulkText = (text: string): ParsedWord[] => {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const words: ParsedWord[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Format 1: word | definition | phonetic | part_of_speech | example
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        if (parts.length >= 2) {
          words.push({
            word: parts[0],
            definition: parts[1],
            phonetic: parts[2] || undefined,
            part_of_speech: parts[3] || undefined,
            example: parts[4] || undefined,
            notes: parts[5] || undefined,
            explanation: parts[6] || undefined,
            tags: parts[7] ? parts[7].split(',').map((t) => t.trim()) : undefined,
          });
        }
      }
      // Format 2: word - definition
      else if (trimmed.includes(' - ')) {
        const [word, ...rest] = trimmed.split(' - ');
        words.push({
          word: word.trim(),
          definition: rest.join(' - ').trim(),
        });
      }
      // Format 3: word: definition
      else if (trimmed.includes(':')) {
        const [word, ...rest] = trimmed.split(':');
        words.push({
          word: word.trim(),
          definition: rest.join(':').trim(),
        });
      }
      // Format 4: chỉ có word (sẽ cần định nghĩa sau)
      else {
        words.push({
          word: trimmed,
          definition: '', // Sẽ cần điền sau
        });
      }
    }

    return words.filter((w) => w.word && w.definition);
  };

  const previewWords = parseBulkText(bulkText);

  const bulkCreateMutation = useMutation({
    mutationFn: async (words: ParsedWord[]) => {
      return await bulkAddWords(deckId, words);
    },
    onSuccess: (data) => {
      toast.success(`Đã thêm ${data.count || previewWords.length} từ thành công!`);
      queryClient.invalidateQueries({ queryKey: ['vocab-words', deckId] });
      setBulkText('');
      setShowPreview(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi thêm từ');
    }
  });

  const handleImport = () => {
    if (previewWords.length === 0) {
      toast.error('Không có từ nào để thêm. Hãy kiểm tra format.');
      return;
    }
    bulkCreateMutation.mutate(previewWords);
  };

  return (
    <div className="rounded-3xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thêm từ hàng loạt</h3>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-primary hover:underline"
        >
          {showPreview ? 'Ẩn preview' : 'Xem preview'}
        </button>
      </div>

      <div className="space-y-2">
        <textarea
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm min-h-[200px] font-mono"
          placeholder={`Nhập nhiều từ, mỗi dòng một từ. Các format hỗ trợ:

1. word | definition | phonetic | part_of_speech | example
   Ví dụ: hello | xin chào | /həˈloʊ/ | interjection | Hello, how are you?`}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Đã parse được: <span className="text-primary font-semibold">{previewWords.length}</span> từ
        </p>
      </div>

      {showPreview && previewWords.length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/30 p-4 max-h-60 overflow-y-auto space-y-2">
          {previewWords.map((w, idx) => (
            <div key={idx} className="text-sm border-b border-slate-700 pb-2 last:border-0">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-primary">{w.word}</span>
                {w.phonetic && <span className="text-slate-400">[{w.phonetic}]</span>}
                {w.part_of_speech && (
                  <span className="text-xs text-slate-500 uppercase">{w.part_of_speech}</span>
                )}
              </div>
              <p className="text-slate-300 text-xs mt-1">{w.definition}</p>
              {w.example && <p className="text-slate-400 text-xs italic mt-1">"{w.example}"</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={previewWords.length === 0 || bulkCreateMutation.isPending}
          className="flex-1 rounded-full bg-primary px-6 py-3 font-semibold disabled:opacity-40"
        >
          {bulkCreateMutation.isPending ? 'Đang thêm...' : `Thêm ${previewWords.length} từ`}
        </button>
        <button
          type="button"
          onClick={() => {
            setBulkText('');
            setShowPreview(false);
          }}
          className="rounded-full border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default BulkWordImport;

