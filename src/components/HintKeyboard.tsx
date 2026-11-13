import type React from 'react';
import { useState } from 'react';
import {
  type Finger,
  KEDMANEE_ROWS,
  type KeyDef,
  type KeyHint,
} from '../data/kedmaneeLayout';
import { isCombiningMark } from '../utils/thaiText';

interface HintKeyboardProps {
  hint: KeyHint | null;
  wrongKeyCode: string | null;
  showQwerty: boolean;
  showFingerColors: boolean;
  interactive?: boolean;
  onToggleInteractive?: () => void;
  onKeyPress?: (char: string, code: string) => void;
  onBackspace?: () => void;
}

const FINGER_CLASSES: Record<Finger, string> = {
  'l-pinky': 'border-rose-300 bg-rose-50/80 text-slate-800 dark:border-rose-500/40 dark:bg-rose-950/35 dark:text-slate-100',
  'l-ring': 'border-orange-300 bg-orange-50/80 text-slate-800 dark:border-orange-500/40 dark:bg-orange-950/35 dark:text-slate-100',
  'l-middle': 'border-amber-300 bg-amber-50/80 text-slate-800 dark:border-amber-500/40 dark:bg-amber-950/35 dark:text-slate-100',
  'l-index': 'border-emerald-300 bg-emerald-50/80 text-slate-800 dark:border-emerald-500/40 dark:bg-emerald-950/35 dark:text-slate-100',
  'r-index': 'border-teal-300 bg-teal-50/80 text-slate-800 dark:border-teal-500/40 dark:bg-teal-950/35 dark:text-slate-100',
  'r-middle': 'border-sky-300 bg-sky-50/80 text-slate-800 dark:border-sky-500/40 dark:bg-sky-950/35 dark:text-slate-100',
  'r-ring': 'border-indigo-300 bg-indigo-50/80 text-slate-800 dark:border-indigo-500/40 dark:bg-indigo-950/35 dark:text-slate-100',
  'r-pinky': 'border-purple-300 bg-purple-50/80 text-slate-800 dark:border-purple-500/40 dark:bg-purple-950/35 dark:text-slate-100',
  thumb: 'border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
};

const HOME_BUMP_CODES = new Set(['KeyF', 'KeyJ']);

const BELOW_MARKS = new Set(['\u0E38', '\u0E39', '\u0E3A']); // ุ ู ฺ
const ABOVE_VOWEL_MARKS = new Set(['\u0E31', '\u0E34', '\u0E35', '\u0E36', '\u0E37']); // ั ิ ี ึ ื

/**
 * Thai combining marks are positioned by the font relative to an invisible
 * consonant baseline, so we nudge each mark group into the key's corner box.
 */
function getCombiningMarkClass(char: string | null, position: 'shifted' | 'unshifted'): string {
  if (!char || !isCombiningMark(char)) return '';

  if (position === 'shifted') {
    if (BELOW_MARKS.has(char)) {
      return 'inline-block pl-1.5 -translate-y-[0.45em]';
    }
    return 'inline-block pl-1.5 translate-y-[0.1em]';
  }

  if (BELOW_MARKS.has(char)) {
    return 'inline-block pr-0.5 -translate-y-[0.15em]';
  }
  if (ABOVE_VOWEL_MARKS.has(char)) {
    return 'inline-block translate-x-[0.2em] translate-y-[0.45em]';
  }
  return 'inline-block translate-x-[0.2em] translate-y-[0.6em]';
}

const DESKTOP_ONLY_MODIFIERS = new Set([
  'Tab',
  'CapsLock',
  'Enter',
  'ControlLeft',
  'AltLeft',
  'AltRight',
  'ControlRight',
]);

const COMPACT_MODIFIER_LABELS: Record<string, string> = {
  Backspace: '⌫',
  ShiftLeft: '⇧',
  ShiftRight: '⇧',
};

export const HintKeyboard: React.FC<HintKeyboardProps> = ({
  hint,
  wrongKeyCode,
  showQwerty,
  showFingerColors,
  interactive = false,
  onToggleInteractive,
  onKeyPress,
  onBackspace,
}) => {
  const [mobileShift, setMobileShift] = useState(false);

  const targetCode = hint?.key.code ?? null;
  const shiftCode = hint?.shiftRequired ? hint.shiftCode : null;
  const isShifted = hint?.shiftRequired ?? false;
  const isShiftActive = interactive && mobileShift;

  const handleKeyTap = (key: KeyDef) => {
    if (!interactive) return;

    if (key.code === 'ShiftLeft' || key.code === 'ShiftRight') {
      setMobileShift((prev) => !prev);
      return;
    }

    if (key.code === 'Backspace') {
      onBackspace?.();
      return;
    }

    const char = isShiftActive ? key.shifted : key.unshifted;
    if (char !== null) {
      onKeyPress?.(char, key.code);
      if (isShiftActive) {
        setMobileShift(false);
      }
    }
  };

  const getKeyStyle = (key: KeyDef): string => {
    const isThisShiftActive =
      isShiftActive && (key.code === 'ShiftLeft' || key.code === 'ShiftRight');

    if (wrongKeyCode === key.code) {
      return 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 dark:ring-rose-400/70 shadow-md';
    }
    if (targetCode === key.code) {
      return 'bg-[#005522] text-white border-[#003d18] ring-2 ring-emerald-400 shadow-md scale-[1.03] z-10 dark:bg-emerald-600 dark:border-emerald-400 dark:ring-emerald-300';
    }
    if (isThisShiftActive) {
      return 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-300 shadow-md';
    }
    if (shiftCode === key.code) {
      return 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300 shadow-md scale-[1.02] z-10';
    }
    if (key.isModifier) {
      return 'bg-slate-200/90 text-slate-600 border-slate-300 shadow-xs dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700';
    }
    if (showFingerColors) {
      return `${FINGER_CLASSES[key.finger]} shadow-xs`;
    }
    return 'bg-white text-slate-800 border-slate-300 shadow-xs dark:bg-slate-800/95 dark:text-slate-100 dark:border-slate-700';
  };

  return (
    <div
      aria-hidden={!interactive}
      className={`${
        interactive ? 'select-none' : 'pointer-events-none select-none'
      } w-full rounded-2xl border border-slate-200 bg-slate-100 p-1.5 sm:p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90`}
    >
      <div className="flex flex-col gap-1 sm:gap-2">
        {KEDMANEE_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex w-full gap-0.5 sm:gap-1.5">
            {row.map((key) => {
              const width = key.width ?? 1;
              const isTarget = targetCode === key.code;
              const isShiftTarget = shiftCode === key.code;
              const isDesktopOnly = DESKTOP_ONLY_MODIFIERS.has(key.code);
              const compactLabel = COMPACT_MODIFIER_LABELS[key.code];
              const isKeyEnabled =
                interactive &&
                !isDesktopOnly &&
                (key.code === 'ShiftLeft' ||
                  key.code === 'ShiftRight' ||
                  key.code === 'Backspace' ||
                  key.unshifted !== null);

              const displayClass = isDesktopOnly ? 'hidden sm:flex' : 'flex';
              const interactiveClass = isKeyEnabled
                ? 'cursor-pointer touch-manipulation active:scale-95 active:brightness-95'
                : '';

              const KeyElement = isKeyEnabled ? 'button' : 'div';
              const keyProps = isKeyEnabled
                ? {
                    type: 'button' as const,
                    onClick: () => handleKeyTap(key),
                    'aria-label':
                      key.code === 'Backspace'
                        ? 'Backspace'
                        : key.code === 'ShiftLeft' || key.code === 'ShiftRight'
                        ? 'Toggle Shift'
                        : key.code === 'Space'
                        ? 'Space'
                        : `Type ${isShiftActive ? key.shifted : key.unshifted}`,
                  }
                : {};

              return (
                <KeyElement
                  key={key.code}
                  {...keyProps}
                  style={{ flex: `${width} 1 0%` }}
                  className={`relative ${displayClass} h-12 sm:h-14 flex-col justify-between rounded-md sm:rounded-lg border px-1 py-1 sm:px-2 sm:py-1.5 text-left transition-all duration-100 ${interactiveClass} ${getKeyStyle(
                    key
                  )}`}
                >
                  {key.isModifier ? (
                    <div className="flex h-full w-full items-center justify-center">
                      {compactLabel ? (
                        <>
                          <span
                            className={`sm:hidden text-xs font-semibold leading-none ${
                              isShiftTarget || isShiftActive ? 'text-slate-950' : ''
                            }`}
                          >
                            {compactLabel}
                          </span>
                          <span
                            className={`hidden sm:inline text-xs font-medium tracking-tight ${
                              isShiftTarget ? 'font-bold text-slate-950' : ''
                            }`}
                          >
                            {key.label ?? key.qwerty}
                          </span>
                        </>
                      ) : (
                        <span
                          className={`text-[10px] sm:text-xs font-medium tracking-tight ${
                            isShiftTarget ? 'font-bold text-slate-950' : ''
                          }`}
                        >
                          {key.label ?? key.qwerty}
                        </span>
                      )}
                    </div>
                  ) : key.code === 'Space' ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className={`text-[11px] sm:text-xs font-medium uppercase tracking-widest ${
                          isTarget ? 'font-bold text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Space
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const isShiftedMark = Boolean(key.shifted && isCombiningMark(key.shifted));
                      const isUnshiftedMark = Boolean(key.unshifted && isCombiningMark(key.unshifted));
                      const shiftedMarkClass = getCombiningMarkClass(key.shifted, 'shifted');
                      const unshiftedMarkClass = getCombiningMarkClass(key.unshifted, 'unshifted');

                      return (
                        <>
                          {/* Top row: Shifted Thai char (top-left) */}
                          <div className="flex w-full items-start justify-between leading-tight">
                            <span
                              className={`font-thai leading-tight transition-all ${
                                shiftedMarkClass ? `${shiftedMarkClass} ` : ''
                              }${
                                isShiftActive
                                  ? `${isShiftedMark ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} font-semibold text-slate-900 dark:text-white`
                                  : isTarget && isShifted
                                  ? `${isShiftedMark ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'} font-bold text-white scale-110`
                                  : isTarget
                                  ? `${isShiftedMark ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'} text-emerald-200/85`
                                  : isShiftedMark
                                  ? 'text-xs sm:text-sm text-slate-600 dark:text-slate-300'
                                  : 'text-[11px] sm:text-xs text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {key.shifted}
                            </span>
                          </div>

                          {/* Bottom row: QWERTY legend (left, hidden on xs) & Unshifted Thai char (right) */}
                          <div className="flex w-full items-end justify-between leading-tight">
                            {showQwerty ? (
                              <span
                                className={`hidden sm:inline font-mono-key text-[10px] leading-none ${
                                  isTarget ? 'text-emerald-200/90 font-semibold' : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {key.qwerty}
                              </span>
                            ) : (
                              <span />
                            )}

                            <span
                              className={`font-thai leading-tight ml-auto ${
                                unshiftedMarkClass ? `${unshiftedMarkClass} ` : ''
                              }${
                                isShiftActive
                                  ? `${isUnshiftedMark ? 'text-sm sm:text-base' : 'text-[11px] sm:text-sm'} text-slate-400 dark:text-slate-500`
                                  : isTarget && !isShifted
                                  ? `${isUnshiftedMark ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'} text-white font-bold`
                                  : isTarget
                                  ? `${isUnshiftedMark ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'} text-emerald-200/80 font-semibold`
                                  : `${isUnshiftedMark ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'} text-slate-800 dark:text-slate-100 font-semibold`
                              }`}
                            >
                              {key.unshifted}
                            </span>
                          </div>

                          {/* Tactile home-row bump on F (ด) and J (่) */}
                          {HOME_BUMP_CODES.has(key.code) && (
                            <span
                              className={`absolute bottom-0.5 left-1/2 h-0.5 w-2 sm:w-3 -translate-x-1/2 rounded-full ${
                                isTarget ? 'bg-white/75' : 'bg-slate-400/70 dark:bg-slate-500/70'
                              }`}
                            />
                          )}
                        </>
                      );
                    })()
                  )}
                </KeyElement>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend + Interactive Toggle */}
      <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#005522] dark:bg-emerald-600 ring-1 ring-emerald-400" />
            Next key
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400 ring-1 ring-amber-500" />
            {interactive ? 'Shift' : 'Hold Shift'}
          </span>
        </div>
        {onToggleInteractive ? (
          <button
            type="button"
            onClick={onToggleInteractive}
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
              interactive
                ? 'border-[#005522]/40 bg-emerald-50 text-[#005522] dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {interactive ? 'Tap-to-Type: ON' : 'Visual Hint Only'}
          </button>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">Thai Kedmanee (Visual Hint Only)</span>
        )}
      </div>
    </div>
  );
};
