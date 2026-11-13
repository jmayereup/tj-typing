import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Keyboard,
  Palette,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { HintKeyboard } from './components/HintKeyboard';
import { LibraryModal } from './components/LibraryModal';
import { KEDMANEE_BY_CODE, findKeyForChar } from './data/kedmaneeLayout';
import {
  BUILTIN_TEXTS,
  CATEGORY_LABELS,
  type PracticeText,
  loadCustomTexts,
  saveCustomTexts,
} from './data/textLibrary';
import {
  formatCharPreview,
  normalizeThaiText,
  segmentThaiGraphemes,
} from './utils/thaiText';

const IGNORED_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
  'CapsLock',
  'Tab',
  'Escape',
]);

export function App() {
  const [customTexts, setCustomTexts] = useState<PracticeText[]>(() => loadCustomTexts());
  const [currentItem, setCurrentItem] = useState<PracticeText>(BUILTIN_TEXTS[0]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Settings
  const [virtualThai, setVirtualThai] = useState(true);
  const [showQwerty, setShowQwerty] = useState(true);
  const [showFingerColors, setShowFingerColors] = useState(false);

  // Typing session state
  const [cursor, setCursor] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [wrongKeyCode, setWrongKeyCode] = useState<string | null>(null);
  const [shakePrompt, setShakePrompt] = useState(false);

  const wrongTimeoutRef = useRef<number | null>(null);

  const normalizedText = useMemo(
    () => normalizeThaiText(currentItem.text),
    [currentItem.text]
  );
  const chars = useMemo(() => Array.from(normalizedText), [normalizedText]);
  const clusters = useMemo(
    () => segmentThaiGraphemes(normalizedText),
    [normalizedText]
  );

  const isComplete = chars.length > 0 && cursor >= chars.length;
  const nextChar = !isComplete ? chars[cursor] : null;
  const nextHint = useMemo(
    () => (nextChar ? findKeyForChar(nextChar) : null),
    [nextChar]
  );

  const resetSession = useCallback(() => {
    setCursor(0);
    setErrors(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setEndTime(null);
    setWrongKeyCode(null);
    setShakePrompt(false);
  }, []);

  const handleSelectText = useCallback(
    (item: PracticeText) => {
      setCurrentItem(item);
      resetSession();
    },
    [resetSession]
  );

  const handleNextText = useCallback(() => {
    const all = [...customTexts, ...BUILTIN_TEXTS];
    const idx = all.findIndex((t) => t.id === currentItem.id);
    const next = all[(idx + 1) % all.length] ?? BUILTIN_TEXTS[0];
    handleSelectText(next);
  }, [customTexts, currentItem.id, handleSelectText]);

  const handleAddCustomText = useCallback(
    (title: string, text: string): PracticeText => {
      const created: PracticeText = {
        id: `custom-${Date.now()}`,
        title,
        category: 'custom',
        text,
      };
      setCustomTexts((prev) => {
        const updated = [created, ...prev];
        saveCustomTexts(updated);
        return updated;
      });
      return created;
    },
    []
  );

  const handleDeleteCustomText = useCallback(
    (id: string) => {
      setCustomTexts((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveCustomTexts(updated);
        return updated;
      });
      if (currentItem.id === id) {
        handleSelectText(BUILTIN_TEXTS[0]);
      }
    },
    [currentItem.id, handleSelectText]
  );

  // Live timer while typing
  useEffect(() => {
    if (!startTime || endTime) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startTime, endTime]);

  const triggerWrongFlash = useCallback((code: string | null) => {
    setWrongKeyCode(code);
    setShakePrompt(true);
    if (wrongTimeoutRef.current) {
      window.clearTimeout(wrongTimeoutRef.current);
    }
    wrongTimeoutRef.current = window.setTimeout(() => {
      setWrongKeyCode(null);
      setShakePrompt(false);
    }, 240);
  }, []);

  // Global keyboard listener for typing practice
  useEffect(() => {
    if (isLibraryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (IGNORED_CODES.has(e.code)) return;

      // Prevent Space or Enter from triggering focused header buttons
      if (document.activeElement instanceof HTMLElement) {
        const tag = document.activeElement.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT') {
          document.activeElement.blur();
        }
      }

      if (isComplete) {
        if (e.code === 'Enter') {
          e.preventDefault();
          resetSession();
        }
        return;
      }

      if (e.code === 'Backspace') {
        e.preventDefault();
        setCursor((prev) => Math.max(0, prev - 1));
        return;
      }

      let typedChar: string | null = null;
      if (virtualThai) {
        const keyDef = KEDMANEE_BY_CODE[e.code];
        if (!keyDef) return;
        typedChar = e.shiftKey ? keyDef.shifted : keyDef.unshifted;
      } else {
        if (e.key.length === 1) {
          typedChar = e.key;
        } else if (e.code === 'Space') {
          typedChar = ' ';
        }
      }

      if (typedChar === null) return;
      e.preventDefault();

      const nowTs = Date.now();
      if (!startTime) {
        setStartTime(nowTs);
        setNow(nowTs);
      }

      setTotalKeystrokes((prev) => prev + 1);

      const expected = chars[cursor];
      if (typedChar === expected) {
        const nextCursor = cursor + 1;
        setCursor(nextCursor);
        if (nextCursor >= chars.length) {
          setEndTime(nowTs);
        }
      } else {
        setErrors((prev) => prev + 1);
        triggerWrongFlash(e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    chars,
    cursor,
    isComplete,
    isLibraryOpen,
    resetSession,
    startTime,
    triggerWrongFlash,
    virtualThai,
  ]);

  // Metrics
  const elapsedMs = startTime ? Math.max(250, (endTime ?? now) - startTime) : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const cpm = startTime && elapsedMinutes > 0 ? Math.round(cursor / elapsedMinutes) : 0;
  const wpm = Math.round(cpm / 5);
  const accuracy =
    totalKeystrokes > 0
      ? Math.max(0, Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100))
      : 100;
  const progressPct = chars.length > 0 ? Math.round((cursor / chars.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:py-8">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
                Thai Typing Practice
              </h1>
              <p className="text-xs text-slate-400">
                Kedmanee layout with visual key hints
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVirtualThai((v) => !v)}
              title="Maps your physical US/QWERTY keys directly to Thai Kedmanee so you don't need to switch OS input"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                virtualThai
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Virtual Thai: {virtualThai ? 'ON' : 'OFF (OS)'}
            </button>

            <button
              type="button"
              onClick={() => setShowQwerty((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                showQwerty
                  ? 'border-slate-600 bg-slate-800 text-slate-100'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              QWERTY: {showQwerty ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setShowFingerColors((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                showFingerColors
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Fingers
            </button>

            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-amber-300"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Texts &amp; Custom
            </button>
          </div>
        </header>

        {/* Active Text Info + Stats */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-slate-900/60 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                {CATEGORY_LABELS[currentItem.category]}
              </span>
              <h2 className="truncate text-sm font-semibold text-slate-100">
                {currentItem.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:gap-5">
            <div>
              <span className="text-slate-400">Progress </span>
              <span className="font-mono-key font-semibold text-slate-100">
                {cursor}/{chars.length}
              </span>
            </div>
            <div>
              <span className="text-slate-400">CPM </span>
              <span className="font-mono-key font-semibold text-amber-300">{cpm}</span>
            </div>
            <div>
              <span className="text-slate-400">WPM </span>
              <span className="font-mono-key font-semibold text-slate-100">{wpm}</span>
            </div>
            <div>
              <span className="text-slate-400">Accuracy </span>
              <span className="font-mono-key font-semibold text-emerald-400">
                {accuracy}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Errors </span>
              <span className="font-mono-key font-semibold text-rose-400">{errors}</span>
            </div>

            <button
              type="button"
              onClick={resetSession}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              title="Restart text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </section>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Typing Prompt Card */}
        <section
          className={`relative rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-lg transition-transform ${
            shakePrompt ? 'animate-shake border-rose-500/50' : ''
          }`}
        >
          <p className="font-thai text-2xl leading-[2.2] tracking-wide sm:text-3xl sm:leading-[2.3]">
            {clusters.map((cluster, idx) => {
              const isDone = cursor >= cluster.endIndex;
              const isCurrent =
                cursor >= cluster.startIndex && cursor < cluster.endIndex;

              return (
                <span
                  key={`${idx}-${cluster.startIndex}`}
                  className={
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'rounded-md bg-amber-400/20 px-0.5 text-amber-200 underline decoration-amber-400 decoration-2 underline-offset-8'
                      : 'text-slate-300'
                  }
                >
                  {cluster.text}
                </span>
              );
            })}
          </p>

          {/* Next Key Callout or Completion Banner */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
            {isComplete ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    Completed! {cpm} CPM ({wpm} WPM) • {accuracy}% accuracy
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetSession}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Practice Again (Enter)
                  </button>
                  <button
                    type="button"
                    onClick={handleNextText}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300"
                  >
                    Next Text
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Next Character
                  </span>
                  {nextChar && (
                    <span className="font-thai inline-flex min-w-10 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-xl font-bold text-amber-300">
                      {formatCharPreview(nextChar)}
                    </span>
                  )}
                  {nextHint ? (
                    <span className="text-xs text-slate-300">
                      Press{' '}
                      {nextHint.shiftRequired && (
                        <>
                          <kbd className="rounded border border-sky-400/50 bg-sky-400/15 px-1.5 py-0.5 font-mono-key text-[11px] font-semibold text-sky-300">
                            {nextHint.shiftCode === 'ShiftLeft' ? 'Left Shift' : 'Right Shift'}
                          </kbd>
                          {' + '}
                        </>
                      )}
                      <kbd className="rounded border border-amber-400/50 bg-amber-400/15 px-1.5 py-0.5 font-mono-key text-[11px] font-semibold text-amber-300">
                        {nextHint.key.qwerty}
                      </kbd>
                    </span>
                  ) : (
                    <span className="text-xs text-amber-300">
                      (Not on Kedmanee — switch Virtual Thai OFF to type directly)
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-500">
                  {startTime
                    ? 'Keep typing…'
                    : virtualThai
                    ? 'Just start typing on your keyboard'
                    : 'Switch OS keyboard to Thai Kedmanee and start typing'}
                </span>
              </>
            )}
          </div>
        </section>

        {/* Visual Hint Keyboard */}
        <HintKeyboard
          hint={nextHint}
          wrongKeyCode={wrongKeyCode}
          showQwerty={showQwerty}
          showFingerColors={showFingerColors}
        />
      </div>

      {/* Text Library & Custom Text Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentTextId={currentItem.id}
        customTexts={customTexts}
        onSelectText={handleSelectText}
        onAddCustomText={handleAddCustomText}
        onDeleteCustomText={handleDeleteCustomText}
      />
    </div>
  );
}

export default App;
