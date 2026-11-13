import type React from 'react';
import { useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, X, Play, AlertTriangle } from 'lucide-react';
import {
  BUILTIN_TEXTS,
  CATEGORY_LABELS,
  type PracticeText,
  type TextCategory,
} from '../data/textLibrary';
import { findUnsupportedChars, normalizeThaiText } from '../utils/thaiText';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTextId: string;
  customTexts: PracticeText[];
  onSelectText: (item: PracticeText) => void;
  onAddCustomText: (title: string, text: string) => PracticeText;
  onDeleteCustomText: (id: string) => void;
}

const CATEGORIES: TextCategory[] = ['basics', 'words', 'phrases', 'proverbs', 'custom'];

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  currentTextId,
  customTexts,
  onSelectText,
  onAddCustomText,
  onDeleteCustomText,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'add'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<TextCategory | 'all'>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');

  const allTexts = useMemo(
    () => [...customTexts, ...BUILTIN_TEXTS],
    [customTexts]
  );

  const filteredTexts = useMemo(() => {
    if (selectedCategory === 'all') return allTexts;
    return allTexts.filter((t) => t.category === selectedCategory);
  }, [allTexts, selectedCategory]);

  const normalizedCustom = useMemo(() => normalizeThaiText(customBody), [customBody]);
  const unsupportedChars = useMemo(
    () => (normalizedCustom ? findUnsupportedChars(normalizedCustom) : []),
    [normalizedCustom]
  );

  if (!isOpen) return null;

  const handleSaveAndPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedCustom) return;
    const title = customTitle.trim() || `Custom Text (${normalizedCustom.slice(0, 18)}…)`;
    const created = onAddCustomText(title, normalizedCustom);
    onSelectText(created);
    setCustomTitle('');
    setCustomBody('');
    setActiveTab('browse');
    onClose();
  };

  const handleQuickPractice = () => {
    if (!normalizedCustom) return;
    onSelectText({
      id: `quick-${Date.now()}`,
      title: customTitle.trim() || 'Quick Custom Text',
      category: 'custom',
      text: normalizedCustom,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] sm:max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-[#005522] px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-emerald-200" />
            <h2 className="font-serif text-lg font-semibold">
              Text Library &amp; Custom Texts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 dark:border-slate-800 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'browse'
                ? 'border-[#005522] text-[#005522] dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Browse Library ({allTexts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'border-[#005522] text-[#005522] dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Custom Text
          </button>
        </div>

        {/* Body */}
        {activeTab === 'browse' ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Category Filter Pills */}
            <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 sm:py-1 text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#005522] text-white dark:bg-emerald-600'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1.5 sm:py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#005522] text-white dark:bg-emerald-600'
                      : 'bg-slate-200/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                  {cat === 'custom' && customTexts.length > 0 ? ` (${customTexts.length})` : ''}
                </button>
              ))}
            </div>

            {/* Text Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
              {filteredTexts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No texts in this category yet.{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="font-medium text-[#005522] hover:underline dark:text-emerald-400"
                  >
                    Add your own Thai text
                  </button>
                  .
                </div>
              ) : (
                filteredTexts.map((item) => {
                  const isActive = item.id === currentTextId;
                  return (
                    <div
                      key={item.id}
                      className={`group flex items-start justify-between gap-4 rounded-xl border p-3.5 transition-colors ${
                        isActive
                          ? 'border-[#005522]/40 bg-emerald-50/70 dark:border-emerald-500/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectText(item);
                          onClose();
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.title}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                          {isActive && (
                            <span className="rounded bg-[#005522] px-2 py-0.5 text-[11px] font-medium text-white dark:bg-emerald-600">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="font-thai mt-1.5 line-clamp-2 text-base text-slate-600 dark:text-slate-300">
                          {item.text}
                        </p>
                        {item.translation && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {item.translation}
                          </p>
                        )}
                      </button>

                      {item.category === 'custom' && (
                        <button
                          type="button"
                          onClick={() => onDeleteCustomText(item.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
                          title="Delete custom text"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveAndPractice} className="flex-1 space-y-4 overflow-y-auto p-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Title (optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Thai News Snippet or Vocabulary List"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#005522] focus:outline-none focus:ring-2 focus:ring-[#005522]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thai Text to Practice
              </label>
              <textarea
                rows={5}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Paste or type short Thai text here... e.g. วันนี้อากาศดีมาก"
                className="font-thai w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-[#005522] focus:outline-none focus:ring-2 focus:ring-[#005522]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                required
              />
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {Array.from(normalizedCustom).length} characters (automatically normalized for Kedmanee)
                </span>
              </div>
            </div>

            {unsupportedChars.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">
                    Some characters are not on the standard Thai Kedmanee layout:
                  </p>
                  <p className="mt-1 font-mono text-amber-800 dark:text-amber-300">
                    {unsupportedChars.map((c) => `"${c}"`).join(', ')}
                  </p>
                  <p className="mt-1 text-amber-700 dark:text-amber-200/80">
                    You may want to remove Latin letters or special symbols before practicing.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={!normalizedCustom}
                onClick={handleQuickPractice}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Play className="h-4 w-4" />
                Practice Once (Don&apos;t Save)
              </button>
              <button
                type="submit"
                disabled={!normalizedCustom}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-[#005522] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00441b] disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                Save &amp; Practice
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
