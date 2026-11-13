import type React from 'react';
import {
  type Finger,
  KEDMANEE_ROWS,
  type KeyDef,
  type KeyHint,
} from '../data/kedmaneeLayout';

interface HintKeyboardProps {
  hint: KeyHint | null;
  wrongKeyCode: string | null;
  showQwerty: boolean;
  showFingerColors: boolean;
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

export const HintKeyboard: React.FC<HintKeyboardProps> = ({
  hint,
  wrongKeyCode,
  showQwerty,
  showFingerColors,
}) => {
  const targetCode = hint?.key.code ?? null;
  const shiftCode = hint?.shiftRequired ? hint.shiftCode : null;
  const isShifted = hint?.shiftRequired ?? false;

  const getKeyStyle = (key: KeyDef): string => {
    if (wrongKeyCode === key.code) {
      return 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 dark:ring-rose-400/70 shadow-md';
    }
    if (targetCode === key.code) {
      return 'bg-[#005522] text-white border-[#003d18] ring-2 ring-emerald-400 shadow-md scale-[1.03] z-10 dark:bg-emerald-600 dark:border-emerald-400 dark:ring-emerald-300';
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
      aria-hidden="true"
      className="pointer-events-none select-none w-full rounded-2xl border border-slate-200 bg-slate-100 p-2.5 sm:p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEDMANEE_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex w-full gap-1 sm:gap-1.5">
            {row.map((key) => {
              const width = key.width ?? 1;
              const isTarget = targetCode === key.code;
              const isShiftTarget = shiftCode === key.code;

              return (
                <div
                  key={key.code}
                  style={{ flex: `${width} 1 0%` }}
                  className={`relative flex h-11 sm:h-13 flex-col justify-between rounded-lg border px-1.5 py-1 transition-all duration-100 ${getKeyStyle(
                    key
                  )}`}
                >
                  {key.isModifier ? (
                    <div className="flex h-full items-center justify-center">
                      <span
                        className={`text-[10px] sm:text-xs font-medium tracking-tight ${
                          isShiftTarget ? 'font-bold text-slate-950' : ''
                        }`}
                      >
                        {key.label ?? key.qwerty}
                      </span>
                    </div>
                  ) : key.code === 'Space' ? (
                    <div className="flex h-full items-center justify-center">
                      <span
                        className={`text-[11px] sm:text-xs font-medium uppercase tracking-widest ${
                          isTarget ? 'font-bold text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Space
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Top row: Shifted Thai char (top-left) */}
                      <div className="flex items-start justify-between leading-none">
                        <span
                          className={`font-thai text-[11px] sm:text-xs leading-none ${
                            isTarget && isShifted
                              ? 'font-bold text-white scale-110'
                              : isTarget
                              ? 'text-emerald-200/75'
                              : 'text-slate-400 dark:text-slate-400'
                          }`}
                        >
                          {key.shifted}
                        </span>
                      </div>

                      {/* Bottom row: QWERTY legend (left) & Unshifted Thai char (right) */}
                      <div className="flex items-end justify-between leading-none">
                        {showQwerty ? (
                          <span
                            className={`font-mono-key text-[9px] sm:text-[10px] leading-none ${
                              isTarget ? 'text-emerald-200/90 font-semibold' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {key.qwerty}
                          </span>
                        ) : (
                          <span />
                        )}

                        <span
                          className={`font-thai text-sm sm:text-base font-semibold leading-none ${
                            isTarget && !isShifted
                              ? 'text-white font-bold'
                              : isTarget
                              ? 'text-emerald-200/75'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {key.unshifted}
                        </span>
                      </div>

                      {/* Tactile home-row bump on F (ด) and J (่) */}
                      {HOME_BUMP_CODES.has(key.code) && (
                        <span
                          className={`absolute bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full ${
                            isTarget ? 'bg-white/75' : 'bg-slate-400/70 dark:bg-slate-500/70'
                          }`}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#005522] dark:bg-emerald-600 ring-1 ring-emerald-400" />
            Next key
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400 ring-1 ring-amber-500" />
            Hold Shift
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500">Thai Kedmanee (Visual Hint Only)</span>
      </div>
    </div>
  );
};
