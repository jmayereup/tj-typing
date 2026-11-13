import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Keyboard,
  Moon,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Type,
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

interface ThaiFontOption {
  id: string;
  label: string;
  cssValue: string;
}

const THAI_FONTS: ThaiFontOption[] = [
  {
    id: 'noto',
    label: 'Noto Sans Thai (Looped)',
    cssValue: '"Noto Sans Thai", "Inter", system-ui, sans-serif',
  },
  {
    id: 'sarabun',
    label: 'Sarabun (Classic)',
    cssValue: '"Sarabun", "Inter", system-ui, sans-serif',
  },
  {
    id: 'ibm',
    label: 'IBM Plex Sans Thai',
    cssValue: '"IBM Plex Sans Thai", "Inter", system-ui, sans-serif',
  },
  {
    id: 'prompt',
    label: 'Prompt (Loopless)',
    cssValue: '"Prompt", "Inter", system-ui, sans-serif',
  },
];

const THEME_STORAGE_KEY = 'tj-typing:theme';
const FONT_STORAGE_KEY = 'tj-typing:thai-font';

function getInitialDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

function getInitialFontId(): string {
  try {
    const saved = localStorage.getItem(FONT_STORAGE_KEY);
    if (saved && THAI_FONTS.some((f) => f.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return THAI_FONTS[0].id;
}

function getIsTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window
  );
}

export function App() {
  const [customTexts, setCustomTexts] = useState<PracticeText[]>(() => loadCustomTexts());
  const [currentItem, setCurrentItem] = useState<PracticeText>(BUILTIN_TEXTS[0]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Appearance & Settings
  const [isDark, setIsDark] = useState<boolean>(() => getInitialDarkMode());
  const [thaiFontId, setThaiFontId] = useState<string>(() => getInitialFontId());
  const [virtualThai, setVirtualThai] = useState(true);
  const [showQwerty, setShowQwerty] = useState(true);
  const [showFingerColors, setShowFingerColors] = useState(false);
  const [interactiveKeyboard, setInteractiveKeyboard] = useState<boolean>(() =>
    getIsTouchDevice()
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const activeClusterRef = useRef<HTMLSpanElement | null>(null);
  const isComposingRef = useRef(false);
  const lastMobileValueRef = useRef('');
  const cursorRef = useRef(cursor);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  // Sync dark mode class & localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  // Sync Thai font CSS variable & localStorage
  useEffect(() => {
    const font = THAI_FONTS.find((f) => f.id === thaiFontId) ?? THAI_FONTS[0];
    document.documentElement.style.setProperty('--font-thai', font.cssValue);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, font.id);
    } catch {
      // ignore
    }
  }, [thaiFontId]);

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
    cursorRef.current = 0;
    setCursor(0);
    setErrors(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setEndTime(null);
    setWrongKeyCode(null);
    setShakePrompt(false);
    isComposingRef.current = false;
    lastMobileValueRef.current = '';
    if (mobileInputRef.current) {
      mobileInputRef.current.value = '';
    }
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

  const handleBackspace = useCallback(() => {
    if (isComplete) return;
    const next = Math.max(0, cursorRef.current - 1);
    cursorRef.current = next;
    setCursor(next);
  }, [isComplete]);

  const handleCharacterInput = useCallback(
    (typedChar: string, keyCode: string | null = null) => {
      const currentCursor = cursorRef.current;
      if (chars.length === 0 || currentCursor >= chars.length) return;

      const nowTs = Date.now();
      if (!startTime) {
        setStartTime(nowTs);
        setNow(nowTs);
      }

      setTotalKeystrokes((prev) => prev + 1);

      const expected = chars[currentCursor];
      if (typedChar === expected) {
        const nextCursor = currentCursor + 1;
        cursorRef.current = nextCursor;
        setCursor(nextCursor);
        if (nextCursor >= chars.length) {
          setEndTime(nowTs);
        }
      } else {
        setErrors((prev) => prev + 1);
        triggerWrongFlash(keyCode);
      }
    },
    [chars, startTime, triggerWrongFlash]
  );

  // Auto-scroll active Thai cluster into view on mobile/long texts
  useEffect(() => {
    activeClusterRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [cursor]);

  const processInsertedText = useCallback(
    (text: string) => {
      for (const ch of Array.from(text)) {
        const hint = findKeyForChar(ch);
        handleCharacterInput(ch, hint?.key.code ?? null);
      }
    },
    [handleCharacterInput]
  );

  const syncMobileValue = useCallback(
    (newValue: string) => {
      const prevChars = Array.from(lastMobileValueRef.current);
      const nextChars = Array.from(newValue);

      let common = 0;
      while (
        common < prevChars.length &&
        common < nextChars.length &&
        prevChars[common] === nextChars[common]
      ) {
        common++;
      }

      const deletedCount = prevChars.length - common;
      for (let i = 0; i < deletedCount; i++) {
        handleBackspace();
      }

      const added = nextChars.slice(common).join('');
      if (added) {
        processInsertedText(added);
      }

      lastMobileValueRef.current = newValue;
    },
    [handleBackspace, processInsertedText]
  );

  // Handle native mobile soft keyboard input (including Android Gboard active IME composition)
  const handleMobileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      syncMobileValue(val);

      // Only clear the input when not in active IME composition so Gboard doesn't lose its buffer
      if (!isComposingRef.current && val) {
        e.target.value = '';
        lastMobileValueRef.current = '';
      }
    },
    [syncMobileValue]
  );

  const handleMobileCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const val = e.currentTarget.value;
      syncMobileValue(val);
      e.currentTarget.value = '';
      lastMobileValueRef.current = '';
    },
    [syncMobileValue]
  );

  const handleMobileBeforeInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const nativeEvent = e.nativeEvent as InputEvent;
      // When the hidden input is already empty, handle Backspace directly
      if (
        nativeEvent.inputType === 'deleteContentBackward' &&
        e.currentTarget.value === ''
      ) {
        e.preventDefault();
        handleBackspace();
      }
    },
    [handleBackspace]
  );

  // Global keyboard listener for typing practice
  useEffect(() => {
    if (isLibraryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (IGNORED_CODES.has(e.code)) return;

      const isMobileInputFocused =
        document.activeElement === mobileInputRef.current;

      // Let mobile soft keyboard / IME (e.g., Android Gboard) handle events via onInput/onCompositionEnd
      if (isMobileInputFocused) {
        if (
          e.isComposing ||
          e.key === 'Unidentified' ||
          e.key === 'Process' ||
          !e.code ||
          (e.key.length === 1 && !/^[\x20-\x7E]$/.test(e.key))
        ) {
          return;
        }
      }

      // Prevent Space, Enter, or arrows from triggering focused header controls
      if (
        !isMobileInputFocused &&
        document.activeElement instanceof HTMLElement
      ) {
        const tag = document.activeElement.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT') {
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
        handleBackspace();
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
      handleCharacterInput(typedChar, e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleBackspace,
    handleCharacterInput,
    isComplete,
    isLibraryOpen,
    resetSession,
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
    <div className="min-h-dvh bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      {/* Teacher Jake Branded Top Navbar */}
      <header className="bg-[#005522] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3 px-3 py-2 sm:px-6 sm:py-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <a
              href="https://www.teacherjake.com/thai"
              title="Back to Teacher Jake Thai"
              className="shrink-0 transition-opacity hover:opacity-90"
            >
              <img
                src="/tj-logo-big-brighter.png"
                alt="Teacher Jake Logo"
                className="h-9 sm:h-10 w-auto rounded shadow-inner object-contain"
              />
            </a>
            <div className="min-w-0">
              <h1 className="truncate font-serif text-base font-bold tracking-tight text-white sm:text-xl leading-tight">
                Thai Typing Practice
              </h1>
              <p className="hidden sm:block text-xs text-emerald-100/80">
                Kedmanee layout with visual key hints
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {/* Thai Font Selector */}
            <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/15">
              <Type className="h-3.5 w-3.5 text-emerald-100" />
              <select
                aria-label="Thai font"
                value={thaiFontId}
                onChange={(e) => {
                  setThaiFontId(e.target.value);
                  e.target.blur();
                }}
                className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                {THAI_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setVirtualThai((v) => !v)}
              title="Maps your physical US/QWERTY keys directly to Thai Kedmanee so you don't need to switch OS input"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                virtualThai
                  ? 'border-emerald-300/60 bg-white/20 text-white'
                  : 'border-white/20 bg-white/10 text-emerald-100/80 hover:bg-white/15'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Virtual Thai: {virtualThai ? 'ON' : 'OFF (OS)'}
            </button>

            <button
              type="button"
              onClick={() => setShowQwerty((v) => !v)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                showQwerty
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-white/15 bg-transparent text-emerald-100/75 hover:bg-white/10'
              }`}
            >
              QWERTY: {showQwerty ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setShowFingerColors((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                showFingerColors
                  ? 'border-amber-300/60 bg-amber-400/20 text-amber-100'
                  : 'border-white/15 bg-transparent text-emerald-100/75 hover:bg-white/10'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Fingers
            </button>

            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-[#005522] shadow-xs hover:bg-emerald-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Texts &amp; Custom
            </button>
          </div>

          {/* Mobile Compact Controls */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              aria-label="Toggle settings"
              aria-expanded={isMobileMenuOpen}
              className={`inline-flex items-center justify-center rounded-xl border p-2 transition-colors ${
                isMobileMenuOpen
                  ? 'border-emerald-300/60 bg-white/25 text-white'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#005522] shadow-xs hover:bg-emerald-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Texts
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Settings Bar */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/15 bg-[#00441b] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white">
                <Type className="h-3.5 w-3.5 text-emerald-100" />
                <select
                  aria-label="Thai font"
                  value={thaiFontId}
                  onChange={(e) => {
                    setThaiFontId(e.target.value);
                    e.target.blur();
                  }}
                  className="bg-transparent text-xs font-medium text-white focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  {THAI_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setVirtualThai((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  virtualThai
                    ? 'border-emerald-300/60 bg-white/20 text-white'
                    : 'border-white/20 bg-white/10 text-emerald-100/80'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Virtual: {virtualThai ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => setShowFingerColors((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  showFingerColors
                    ? 'border-amber-300/60 bg-amber-400/20 text-amber-100'
                    : 'border-white/15 bg-transparent text-emerald-100/75'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                Fingers
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 sm:gap-5 px-2.5 py-3 sm:px-6 sm:py-6 lg:py-8">
        {/* Active Text Info + Stats */}
        <section className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2.5 sm:gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 rounded-md border border-[#005522]/15 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#005522] dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-300">
                {CATEGORY_LABELS[currentItem.category]}
              </span>
              <h2 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {currentItem.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetSession}
              className="sm:hidden shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="Restart text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1 text-center sm:flex sm:flex-wrap sm:items-center sm:gap-5 sm:text-left text-[11px] sm:text-xs">
            <div className="flex flex-col sm:block">
              <span className="text-slate-500 dark:text-slate-400">Progress </span>
              <span className="font-mono-key font-semibold text-slate-800 dark:text-slate-100">
                {cursor}/{chars.length}
              </span>
            </div>
            <div className="flex flex-col sm:block">
              <span className="text-slate-500 dark:text-slate-400">CPM </span>
              <span className="font-mono-key font-semibold text-[#005522] dark:text-emerald-400">
                {cpm}
              </span>
            </div>
            <div className="flex flex-col sm:block">
              <span className="text-slate-500 dark:text-slate-400">WPM </span>
              <span className="font-mono-key font-semibold text-slate-800 dark:text-slate-100">
                {wpm}
              </span>
            </div>
            <div className="flex flex-col sm:block">
              <span className="text-slate-500 dark:text-slate-400">Accuracy </span>
              <span className="font-mono-key font-semibold text-emerald-700 dark:text-emerald-400">
                {accuracy}%
              </span>
            </div>
            <div className="flex flex-col sm:block">
              <span className="text-slate-500 dark:text-slate-400">Errors </span>
              <span className="font-mono-key font-semibold text-rose-600 dark:text-rose-400">
                {errors}
              </span>
            </div>

            <button
              type="button"
              onClick={resetSession}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Restart text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </section>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-[#005522] dark:bg-emerald-500 transition-all duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Typing Prompt Card */}
        <section
          onClick={() => {
            if (!isComplete) {
              mobileInputRef.current?.focus();
            }
          }}
          className={`relative rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 shadow-sm transition-transform dark:border-slate-800 dark:bg-slate-900/80 ${
            shakePrompt ? 'animate-shake border-rose-400 dark:border-rose-500/70' : ''
          }`}
        >
          {/* Hidden input for native mobile OS keyboard */}
          <input
            ref={mobileInputRef}
            type="text"
            inputMode="text"
            enterKeyHint="done"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Type Thai characters"
            onChange={handleMobileInput}
            onBeforeInput={handleMobileBeforeInput}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={handleMobileCompositionEnd}
            className="pointer-events-none absolute left-4 top-4 h-px w-px opacity-0 text-base"
          />

          <p className="font-thai max-h-[28dvh] overflow-y-auto sm:max-h-none text-2xl leading-[2.2] tracking-wide sm:text-3xl sm:leading-[2.3]">
            {clusters.map((cluster, idx) => {
              const isDone = cursor >= cluster.endIndex;
              const isCurrent =
                cursor >= cluster.startIndex && cursor < cluster.endIndex;

              return (
                <span
                  key={`${idx}-${cluster.startIndex}`}
                  ref={isCurrent ? activeClusterRef : undefined}
                  className={
                    isDone
                      ? 'text-[#005522] dark:text-emerald-400'
                      : isCurrent
                      ? 'rounded-md bg-emerald-100/90 px-0.5 text-[#005522] font-semibold underline decoration-[#005522] decoration-2 underline-offset-8 dark:bg-emerald-500/20 dark:text-emerald-200 dark:decoration-emerald-400'
                      : 'text-slate-400 dark:text-slate-400'
                  }
                >
                  {cluster.text}
                </span>
              );
            })}
          </p>

          {/* Next Key Callout or Completion Banner */}
          <div className="mt-3 sm:mt-5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-100 pt-3 sm:pt-4 dark:border-slate-800">
            {isComplete ? (
              <div className="flex w-full flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#005522] dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">
                    Completed! {cpm} CPM ({wpm} WPM) • {accuracy}% accuracy
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetSession();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Practice Again
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextText();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#005522] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#00441b] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Next Text
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Next
                  </span>
                  {nextChar && (
                    <span className="font-thai inline-flex min-w-9 sm:min-w-10 items-center justify-center rounded-lg border border-[#005522]/30 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-lg sm:text-xl font-bold text-[#005522] dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {formatCharPreview(nextChar)}
                    </span>
                  )}
                  {nextHint ? (
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="hidden sm:inline">Press </span>
                      {nextHint.shiftRequired && (
                        <>
                          <kbd className="rounded border border-amber-400 bg-amber-100 px-1.5 py-0.5 font-mono-key text-[11px] font-semibold text-amber-950 dark:border-amber-400/50 dark:bg-amber-400/20 dark:text-amber-200">
                            {nextHint.shiftCode === 'ShiftLeft' ? 'L Shift' : 'R Shift'}
                          </kbd>
                          {' + '}
                        </>
                      )}
                      <kbd className="rounded border border-[#005522]/30 bg-emerald-50 px-1.5 py-0.5 font-mono-key text-[11px] font-semibold text-[#005522] dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {nextHint.key.qwerty}
                      </kbd>
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      (Not on Kedmanee — type directly)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      mobileInputRef.current?.focus();
                    }}
                    className="sm:hidden inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Keyboard className="h-3 w-3" />
                    Phone Keyboard
                  </button>
                  <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
                    {startTime
                      ? 'Keep typing…'
                      : interactiveKeyboard
                      ? 'Tap keys below or type on your keyboard'
                      : virtualThai
                      ? 'Just start typing on your keyboard'
                      : 'Switch OS keyboard to Thai Kedmanee and start typing'}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Visual / Interactive Hint Keyboard */}
        <HintKeyboard
          hint={nextHint}
          wrongKeyCode={wrongKeyCode}
          showQwerty={showQwerty}
          showFingerColors={showFingerColors}
          interactive={interactiveKeyboard}
          onToggleInteractive={() => setInteractiveKeyboard((v) => !v)}
          onKeyPress={handleCharacterInput}
          onBackspace={handleBackspace}
        />
      </main>

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
