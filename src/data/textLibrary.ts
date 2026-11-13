export type TextCategory = 'basics' | 'words' | 'phrases' | 'proverbs' | 'custom';

export interface PracticeText {
  id: string;
  title: string;
  category: TextCategory;
  text: string;
  description?: string;
}

export const CATEGORY_LABELS: Record<TextCategory, string> = {
  basics: 'Home Row & Basics',
  words: 'Common Words',
  phrases: 'Everyday Phrases',
  proverbs: 'Proverbs & Short Texts',
  custom: 'My Custom Texts',
};

export const BUILTIN_TEXTS: PracticeText[] = [
  {
    id: 'basics-home-row',
    title: 'Home Row Drill (ฟ ห ก ด เ ้ ่ า ส ว)',
    category: 'basics',
    description: 'Practice the unshifted home row keys without moving your fingers far.',
    text: 'ฟหกด าสว ฟหกด าสว กา ดา สา หา มา นา กาสา ดาวา',
  },
  {
    id: 'basics-tones',
    title: 'Tone Marks & Vowels',
    category: 'basics',
    description: 'Simple syllables combining consonants, vowels, and tone marks.',
    text: 'ก่า ก้า ก๊า ก๋า กิ กี กึ กือ กุ กู เกา แกะ โก ไป ใจ',
  },
  {
    id: 'basics-shift',
    title: 'Shifted Consonants Warmup',
    category: 'basics',
    description: 'Practice holding Shift for common shifted consonants and symbols.',
    text: 'โถ ฤดู ฆ่า ฏัก ฌาน ษมา ศาลา ซื้อ ฉิ่ง ฮูก ฒ่า ณ',
  },
  {
    id: 'words-greetings',
    title: 'Greetings & Polite Words',
    category: 'words',
    description: 'Everyday polite expressions in Thai.',
    text: 'สวัสดี ครับ ค่ะ ขอบคุณ มาก ขอโทษ ไม่ เป็น ไร ยินดี ที่ ได้ รู้จัก',
  },
  {
    id: 'words-numbers-time',
    title: 'Time & Days',
    category: 'words',
    description: 'Common words for talking about today, tomorrow, and time.',
    text: 'วันนี้ พรุ่งนี้ เมื่อวาน เช้า สาย บ่าย เย็น กลางคืน ชั่วโมง นาที',
  },
  {
    id: 'phrases-coffee',
    title: 'Ordering Iced Coffee',
    category: 'phrases',
    description: 'A short practical sentence at a Thai café.',
    text: 'ขอ กาแฟ เย็น หนึ่ง แก้ว ไม่ หวาน มาก นะ ครับ ขอบคุณ ครับ',
  },
  {
    id: 'phrases-weather',
    title: 'A Walk in the Park',
    category: 'phrases',
    description: 'Short conversational sentence about the weather.',
    text: 'วันนี้ อากาศ ดี มาก เลย อยาก ออก ไป เดิน เล่น ที่ สวน สาธารณะ',
  },
  {
    id: 'phrases-learning',
    title: 'Learning Thai',
    category: 'phrases',
    description: 'Encouraging sentence for Thai language learners.',
    text: 'ภาษา ไทย ไม่ ยาก อย่าง ที่ คิด ถ้า เรา ฝึก พิมพ์ ทุก วัน',
  },
  {
    id: 'proverb-effort',
    title: 'Where There Is Effort',
    category: 'proverbs',
    description: 'Classic Thai saying about perseverance.',
    text: 'ความ พยายาม อยู่ ที่ ไหน ความ สำเร็จ อยู่ ที่ นั่น',
  },
  {
    id: 'proverb-slowly',
    title: 'Slow and Steady',
    category: 'proverbs',
    description: 'Thai proverb: ช้า ๆ ได้พร้าเล่มงาม.',
    text: 'ช้า ๆ ได้ พร้า เล่ม งาม น้ำ ขึ้น ให้ รีบ ตัก',
  },
];

const CUSTOM_STORAGE_KEY = 'tj-typing:custom-texts:v1';

export function loadCustomTexts(): PracticeText[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PracticeText =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.text === 'string'
    );
  } catch {
    return [];
  }
}

export function saveCustomTexts(texts: PracticeText[]): void {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(texts));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

