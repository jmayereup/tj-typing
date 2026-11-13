import type React from 'react';
import { Settings2, Turtle, Volume2, Pause, Play } from 'lucide-react';

interface AudioControlsProps {
  onVoiceOpen?: () => void;
  onSlowToggle: () => void;
  onListenToggle: () => void;
  ttsStatus: 'playing' | 'paused' | 'stopped';
  currentRate: number;
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  onVoiceOpen,
  onSlowToggle,
  onListenToggle,
  ttsStatus,
  currentRate,
  className = '',
}) => {
  const isSlowActive =
    currentRate === 0.6 && (ttsStatus === 'playing' || ttsStatus === 'paused');
  const isListenActive =
    currentRate === 1.0 && (ttsStatus === 'playing' || ttsStatus === 'paused');

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {onVoiceOpen && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            onVoiceOpen();
          }}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-[#005522] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-300"
          title="Voice Settings"
          aria-label="Voice Settings"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            onSlowToggle();
          }}
          className={`inline-flex items-center gap-1 border-r border-slate-200 px-2 py-1.5 text-xs font-medium transition-colors dark:border-slate-700 ${
            isSlowActive
              ? 'bg-emerald-50 text-[#005522] dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          title="Listen Slowly (0.6x)"
          aria-label="Listen Slowly"
        >
          {isSlowActive && ttsStatus === 'playing' ? (
            <Pause className="h-3.5 w-3.5" />
          ) : isSlowActive && ttsStatus === 'paused' ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Turtle className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.currentTarget.blur();
            onListenToggle();
          }}
          className={`inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors ${
            isListenActive
              ? 'bg-emerald-50 text-[#005522] dark:bg-emerald-950/70 dark:text-emerald-300'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          title="Listen (Normal Speed)"
          aria-label="Listen"
        >
          {isListenActive && ttsStatus === 'playing' ? (
            <Pause className="h-3.5 w-3.5" />
          ) : isListenActive && ttsStatus === 'paused' ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
