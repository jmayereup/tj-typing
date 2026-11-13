import { useState, useEffect, useRef, useCallback } from 'react';
import { getVoicesForLang, getBestVoice } from '../utils/tts';

const VOICE_STORAGE_KEY = 'tj-typing:tts-voice-th-TH';

export interface TTSState {
  status: 'playing' | 'paused' | 'stopped';
  rate: number;
}

interface UseTTSProps {
  defaultText: string;
  langCode?: string;
}

export const useTTS = ({ defaultText, langCode = 'th-TH' }: UseTTSProps) => {
  const [ttsState, setTtsState] = useState<TTSState>({
    status: 'stopped',
    rate: 1.0,
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  const userHasSelectedVoice = useRef(false);
  const activeContentRef = useRef<string | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      const voices = getVoicesForLang(langCode);
      setAvailableVoices(voices);

      const allVoices = window.speechSynthesis.getVoices();
      let savedVoiceName: string | null = null;
      try {
        savedVoiceName = localStorage.getItem(VOICE_STORAGE_KEY);
      } catch {
        // ignore
      }

      if (savedVoiceName && allVoices.some((v) => v.name === savedVoiceName)) {
        setSelectedVoiceName(savedVoiceName);
        userHasSelectedVoice.current = true;
      } else if (!userHasSelectedVoice.current) {
        const best = getBestVoice(langCode);
        if (best) setSelectedVoiceName(best.name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener?.('voiceschanged', updateVoices);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoices);
      }
    };
  }, [langCode]);

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeContentRef.current = null;
    setTtsState((prev) => ({ ...prev, status: 'stopped' }));
  }, []);

  const toggleTTS = useCallback(
    (rate: number, overrideText?: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      const textToSpeak = (overrideText ?? defaultText).trim();
      if (!textToSpeak) return;

      const synth = window.speechSynthesis;

      // Clicking the active speed button toggles pause/resume
      if (
        ttsState.rate === rate &&
        ttsState.status !== 'stopped' &&
        activeContentRef.current === textToSpeak
      ) {
        if (ttsState.status === 'playing') {
          synth.pause();
          setTtsState((prev) => ({ ...prev, status: 'paused' }));
        } else {
          synth.resume();
          setTtsState((prev) => ({ ...prev, status: 'playing' }));
        }
        return;
      }

      activeContentRef.current = textToSpeak;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      utterance.rate = rate;

      const voices = synth.getVoices();
      let voiceToUse: SpeechSynthesisVoice | null = null;

      if (selectedVoiceName) {
        const selected = voices.find((v) => v.name === selectedVoiceName);
        if (selected) {
          const reqPrefix = langCode.split(/[-_]/)[0].toLowerCase();
          const voicePrefix = selected.lang.split(/[-_]/)[0].toLowerCase();
          if (
            reqPrefix === voicePrefix ||
            selected.name.toLowerCase().includes('multilingual') ||
            selected.name.toLowerCase().includes('multi-lingual')
          ) {
            voiceToUse = selected;
          }
        }
      }

      if (!voiceToUse) {
        voiceToUse = getBestVoice(langCode);
      }

      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.onend = () => {
        setTtsState((prev) => ({ ...prev, status: 'stopped' }));
      };
      utterance.onerror = () => {
        setTtsState((prev) => ({ ...prev, status: 'stopped' }));
      };

      synth.speak(utterance);
      setTtsState({ status: 'playing', rate });
    },
    [defaultText, langCode, selectedVoiceName, ttsState.rate, ttsState.status]
  );

  const handleSetSelectedVoiceName = useCallback((name: string | null) => {
    userHasSelectedVoice.current = true;
    setSelectedVoiceName(name);
    try {
      if (name) {
        localStorage.setItem(VOICE_STORAGE_KEY, name);
      } else {
        localStorage.removeItem(VOICE_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    ttsState,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName: handleSetSelectedVoiceName,
    toggleTTS,
    stopTTS,
  };
};
