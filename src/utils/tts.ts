export const getVoiceQualityScore = (
  voice: SpeechSynthesisVoice,
  targetLangCode: string = 'th-TH'
): number => {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace('_', '-');
  const target = targetLangCode.toLowerCase().replace('_', '-');
  const targetPrimary = target.split('-')[0];

  // 1. Language matching precision
  if (lang === target) {
    score += 30;
  } else if (
    lang.startsWith(targetPrimary) ||
    targetPrimary.startsWith(lang.split('-')[0])
  ) {
    score += 20;
  } else if (name.includes('multilingual') || name.includes('multi-lingual')) {
    // Prefer English-base multilingual voices over other languages (e.g., German)
    score += lang.startsWith('en') ? 12 : 5;
  } else if (lang.startsWith('en')) {
    // Fallback to English before other non-target languages
    score -= 50;
  } else {
    score -= 100;
  }

  // 2. High-Quality / Neural / Multilingual Tier
  if (name.includes('multilingual') || name.includes('multi-lingual')) score += 25;
  if (name.includes('enhanced')) score += 25;
  if (name.includes('premium')) score += 25;
  if (name.includes('natural')) score += 20;
  if (name.includes('neural')) score += 20;
  if (name.includes('wavenet')) score += 20;

  // 3. Siri & Apple Voices
  if (name.includes('siri')) score += 15;
  if (name.includes('kanya')) score += 15;
  if (name.includes('narisa')) score += 15;

  // 4. Android / Google / Online Voices
  if (name.includes('google')) score += 12;
  if (name.includes('online')) score += 10;

  // 5. System Defaults & Local Service
  if (voice.default) score += 5;
  if (voice.localService) score += 2;

  // 6. Low-Quality Penalties
  if (name.includes('compact')) score -= 20;
  if (
    /novelty|boing|whisper|deranged|cellos|zarvox|pipe|bad news|albert|fred|trinoids/i.test(
      name
    )
  ) {
    score -= 30;
  }

  return score;
};

export const getAllVoicesSorted = (lang: string = 'th-TH'): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return [...voices].sort(
    (a, b) => getVoiceQualityScore(b, lang) - getVoiceQualityScore(a, lang)
  );
};

export const getBestVoice = (lang: string = 'th-TH'): SpeechSynthesisVoice | null => {
  const matching = getVoicesForLang(lang);
  if (matching.length > 0) return matching[0];
  const all = getAllVoicesSorted(lang);
  return all[0] || null;
};

export const getVoicesForLang = (lang: string = 'th-TH'): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split(/[-_]/)[0].toLowerCase();

  const matchingVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase() === lang.toLowerCase() ||
      v.lang.split(/[-_]/)[0].toLowerCase() === langPrefix ||
      v.name.toLowerCase().includes('multilingual') ||
      v.name.toLowerCase().includes('multi-lingual')
  );

  return matchingVoices.sort(
    (a, b) => getVoiceQualityScore(b, lang) - getVoiceQualityScore(a, lang)
  );
};

export const shouldShowAudioControls = (): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(ua);

  // On Android, in-app browsers often have broken SpeechSynthesis.
  const isProblematicInApp =
    isAndroid &&
    (ua.includes('instagram') ||
      ua.includes('facebook') ||
      ua.includes('messenger') ||
      ua.includes('fb_iab') ||
      ua.includes('fban') ||
      ua.includes('fbav') ||
      ua.includes('line'));

  if (ua.includes('wv') || ua.includes('webview') || isProblematicInApp) {
    return false;
  }

  return true;
};
