import React from 'react';
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
  'l-pinky': 'border-rose-500/35 bg-rose-950/20',
  'l-ring': 'border-orange-500/35 bg-orange-950/20',
  'l-middle': 'border-amber-500/35 bg-amber-950/20',
  'l-index': 'border-emerald-500/35 bg-emerald-950/20',
  'r-index': 'border-teal-500/35 bg-teal-950/20',
  'r-middle': 'border-sky-500/35 bg-sky-950/20',
  'r-ring': 'border-indigo-500/35 bg-indigo-950/20',
  'r-pinky': 'border-purple-500/35 bg-purple-950/20',
  thumb: 'border-slate-600/60 bg-slate-800/70',
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
      return 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-400/70 shadow-md shadow-rose-500/30';
    }
    if (targetCode === key.code) {
      return 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-300 shadow-lg shadow-amber-500/30 scale-[1.03] z-10';
    }
    if (shiftCode === key.code) {
      return 'bg-sky-400 text-slate-950 border-sky-200 ring-2 ring-sky-300 shadow-lg shadow-sky-500/30 scale-[1.02] z-10';
    }
    if (key.isModifier) {
      return 'bg-slate-800/80 text-slate-400 border-slate-700/80';
    }
    if (showFingerColors) {
      return `${FINGER_CLASSES[key.finger]} text-slate-200`;
    }
    return 'bg-slate-800/95 text-slate-200 border-slate-700/90';
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3.5 shadow-xl"
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
                          isTarget ? 'font-bold text-slate-950' : 'text-slate-400'
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
                              ? 'font-bold text-slate-950 scale-110'
                              : isTarget
                              ? 'text-slate-800/70'
                              : 'text-slate-400'
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
                              isTarget ? 'text-slate-800/80 font-semibold' : 'text-slate-500'
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
                              ? 'text-slate-950 font-bold'
                              : isTarget
                              ? 'text-slate-800/70'
                              : 'text-slate-100'
                          }`}
                        >
                          {key.unshifted}
                        </span>
                      </div>

                      {/* Tactile home-row bump on F (ด) and J (่) */}
                      {HOME_BUMP_CODES.has(key.code) && (
                        <span
                          className={`absolute bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full ${
                            isTarget ? 'bg-slate-900/60' : 'bg-slate-500/70'
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
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400 ring-1 ring-amber-300" />
            Next key
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400 ring-1 ring-sky-300" />
            Hold Shift
          </span>
        </div>
        <span className="text-slate-500">Thai Kedmanee (Visual Hint Only)</span>
      </div>
    </div>
  );
};
