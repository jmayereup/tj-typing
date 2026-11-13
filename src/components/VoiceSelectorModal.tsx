import type React from 'react';
import { useEffect, useState } from 'react';
import { X, PlayCircle, CheckCircle2, Volume2, Globe } from 'lucide-react';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  allVoices?: SpeechSynthesisVoice[];
  selectedVoiceName: string | null;
  onSelectVoice: (voiceName: string) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  voices,
  allVoices = [],
  selectedVoiceName,
  onSelectVoice,
}) => {
  const [testPlaying, setTestPlaying] = useState<string | null>(null);
  const [showAllVoices, setShowAllVoices] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const testVoice = (voice: SpeechSynthesisVoice) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('สวัสดีครับ นี่คือเสียงภาษาไทย');
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 1.0;

    utterance.onstart = () => setTestPlaying(voice.name);
    utterance.onend = () => setTestPlaying(null);
    utterance.onerror = () => setTestPlaying(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/75 p-3 sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-[#005522] px-5 py-4 text-white dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Volume2 className="h-5 w-5 text-emerald-200" />
            <div>
              <h2 className="font-serif text-lg font-semibold leading-tight">
                Thai Voice Settings
              </h2>
              <p className="text-xs text-emerald-100/80">
                Select your preferred Thai text-to-speech voice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
            aria-label="Close voice settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Voice List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {voices.length === 0 && allVoices.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <Globe className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No voices found in this browser.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your browser/OS has no text-to-speech voices available.
              </p>
            </div>
          ) : (
            <>
              {voices.length === 0 && allVoices.length > 0 && (
                <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
                  No Thai (th-TH) or multilingual voices found. Showing all available system voices (English preferred by default).
                </div>
              )}

              {(voices.length === 0 || showAllVoices ? allVoices : voices).map((voice) => {
              const isSelected = voice.name === selectedVoiceName;
              const vName = voice.name.toLowerCase();
              const isNatural =
                vName.includes('natural') ||
                vName.includes('google') ||
                vName.includes('enhanced') ||
                vName.includes('premium') ||
                vName.includes('neural') ||
                vName.includes('wavenet') ||
                vName.includes('multilingual') ||
                vName.includes('multi-lingual') ||
                vName.includes('siri') ||
                vName.includes('kanya') ||
                vName.includes('narisa');

              return (
                <div
                  key={`${voice.name}-${voice.lang}`}
                  onClick={() => onSelectVoice(voice.name)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
                    isSelected
                      ? 'border-[#005522] bg-emerald-50/80 dark:border-emerald-500/60 dark:bg-emerald-950/40'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`truncate text-sm font-semibold ${
                          isSelected
                            ? 'text-[#005522] dark:text-emerald-300'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {voice.name}
                      </span>
                      {isNatural && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#005522] dark:bg-emerald-500/20 dark:text-emerald-300">
                          High Quality
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {voice.lang}
                      {voice.localService ? ' • Offline' : ' • Online'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voice);
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        testPlaying === voice.name
                          ? 'border-[#005522] bg-[#005522] text-white dark:border-emerald-500 dark:bg-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      {testPlaying === voice.name ? 'Playing' : 'Test'}
                    </button>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-[#005522] dark:text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })}

              {voices.length > 0 && allVoices.length > voices.length && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllVoices((v) => !v)}
                    className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-[#005522] hover:underline dark:text-slate-400 dark:hover:text-emerald-300"
                  >
                    {showAllVoices
                      ? `Show only Thai & multilingual voices (${voices.length})`
                      : `Show all system voices (${allVoices.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#005522] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00441b] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
