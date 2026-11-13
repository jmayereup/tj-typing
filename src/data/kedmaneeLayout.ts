export type Hand = 'left' | 'right' | 'thumb';

export type Finger =
  | 'l-pinky'
  | 'l-ring'
  | 'l-middle'
  | 'l-index'
  | 'r-index'
  | 'r-middle'
  | 'r-ring'
  | 'r-pinky'
  | 'thumb';

export interface KeyDef {
  /** Physical KeyboardEvent.code (e.g. 'KeyD', 'Space', 'ShiftLeft') */
  code: string;
  /** Visual US QWERTY legend */
  qwerty: string;
  /** Unshifted Thai character (or null for modifier/non-char keys) */
  unshifted: string | null;
  /** Shifted Thai character (or null for modifier/non-char keys) */
  shifted: string | null;
  /** Relative key width in 'u' units (1u = standard key) */
  width?: number;
  /** Hand responsible for this key */
  hand: Hand;
  /** Finger zone for optional color-coding */
  finger: Finger;
  /** True for non-typing visual modifier keys like Tab, Caps, Enter, Shift */
  isModifier?: boolean;
  /** Optional display label for modifier keys */
  label?: string;
}

export const KEDMANEE_ROWS: KeyDef[][] = [
  // Row 1: Number Row
  [
    { code: 'Backquote', qwerty: '`', unshifted: '_', shifted: '%', hand: 'left', finger: 'l-pinky' },
    { code: 'Digit1', qwerty: '1', unshifted: 'ๅ', shifted: '+', hand: 'left', finger: 'l-pinky' },
    { code: 'Digit2', qwerty: '2', unshifted: '/', shifted: '๑', hand: 'left', finger: 'l-ring' },
    { code: 'Digit3', qwerty: '3', unshifted: '-', shifted: '๒', hand: 'left', finger: 'l-middle' },
    { code: 'Digit4', qwerty: '4', unshifted: 'ภ', shifted: '๓', hand: 'left', finger: 'l-index' },
    { code: 'Digit5', qwerty: '5', unshifted: 'ถ', shifted: '๔', hand: 'left', finger: 'l-index' },
    { code: 'Digit6', qwerty: '6', unshifted: 'ุ', shifted: 'ู', hand: 'right', finger: 'r-index' },
    { code: 'Digit7', qwerty: '7', unshifted: 'ึ', shifted: '฿', hand: 'right', finger: 'r-index' },
    { code: 'Digit8', qwerty: '8', unshifted: 'ค', shifted: '๕', hand: 'right', finger: 'r-middle' },
    { code: 'Digit9', qwerty: '9', unshifted: 'ต', shifted: '๖', hand: 'right', finger: 'r-ring' },
    { code: 'Digit0', qwerty: '0', unshifted: 'จ', shifted: '๗', hand: 'right', finger: 'r-pinky' },
    { code: 'Minus', qwerty: '-', unshifted: 'ข', shifted: '๘', hand: 'right', finger: 'r-pinky' },
    { code: 'Equal', qwerty: '=', unshifted: 'ช', shifted: '๙', hand: 'right', finger: 'r-pinky' },
    {
      code: 'Backspace',
      qwerty: '⌫',
      unshifted: null,
      shifted: null,
      width: 2,
      hand: 'right',
      finger: 'r-pinky',
      isModifier: true,
      label: 'Backspace',
    },
  ],
  // Row 2: Top Alpha Row
  [
    {
      code: 'Tab',
      qwerty: 'Tab',
      unshifted: null,
      shifted: null,
      width: 1.5,
      hand: 'left',
      finger: 'l-pinky',
      isModifier: true,
      label: 'Tab',
    },
    { code: 'KeyQ', qwerty: 'Q', unshifted: 'ๆ', shifted: '๐', hand: 'left', finger: 'l-pinky' },
    { code: 'KeyW', qwerty: 'W', unshifted: 'ไ', shifted: '"', hand: 'left', finger: 'l-ring' },
    { code: 'KeyE', qwerty: 'E', unshifted: 'ำ', shifted: 'ฎ', hand: 'left', finger: 'l-middle' },
    { code: 'KeyR', qwerty: 'R', unshifted: 'พ', shifted: 'ฑ', hand: 'left', finger: 'l-index' },
    { code: 'KeyT', qwerty: 'T', unshifted: 'ะ', shifted: 'ธ', hand: 'left', finger: 'l-index' },
    { code: 'KeyY', qwerty: 'Y', unshifted: 'ั', shifted: 'ํ', hand: 'right', finger: 'r-index' },
    { code: 'KeyU', qwerty: 'U', unshifted: 'ี', shifted: '๊', hand: 'right', finger: 'r-index' },
    { code: 'KeyI', qwerty: 'I', unshifted: 'ร', shifted: 'ณ', hand: 'right', finger: 'r-middle' },
    { code: 'KeyO', qwerty: 'O', unshifted: 'น', shifted: 'ฯ', hand: 'right', finger: 'r-ring' },
    { code: 'KeyP', qwerty: 'P', unshifted: 'ย', shifted: 'ญ', hand: 'right', finger: 'r-pinky' },
    { code: 'BracketLeft', qwerty: '[', unshifted: 'บ', shifted: 'ฐ', hand: 'right', finger: 'r-pinky' },
    { code: 'BracketRight', qwerty: ']', unshifted: 'ล', shifted: ',', hand: 'right', finger: 'r-pinky' },
    { code: 'Backslash', qwerty: '\\', unshifted: 'ฃ', shifted: 'ฅ', width: 1.5, hand: 'right', finger: 'r-pinky' },
  ],
  // Row 3: Home Row
  [
    {
      code: 'CapsLock',
      qwerty: 'Caps',
      unshifted: null,
      shifted: null,
      width: 1.75,
      hand: 'left',
      finger: 'l-pinky',
      isModifier: true,
      label: 'Caps',
    },
    { code: 'KeyA', qwerty: 'A', unshifted: 'ฟ', shifted: 'ฤ', hand: 'left', finger: 'l-pinky' },
    { code: 'KeyS', qwerty: 'S', unshifted: 'ห', shifted: 'ฆ', hand: 'left', finger: 'l-ring' },
    { code: 'KeyD', qwerty: 'D', unshifted: 'ก', shifted: 'ฏ', hand: 'left', finger: 'l-middle' },
    { code: 'KeyF', qwerty: 'F', unshifted: 'ด', shifted: 'โ', hand: 'left', finger: 'l-index' },
    { code: 'KeyG', qwerty: 'G', unshifted: 'เ', shifted: 'ฌ', hand: 'left', finger: 'l-index' },
    { code: 'KeyH', qwerty: 'H', unshifted: '้', shifted: '็', hand: 'right', finger: 'r-index' },
    { code: 'KeyJ', qwerty: 'J', unshifted: '่', shifted: '๋', hand: 'right', finger: 'r-index' },
    { code: 'KeyK', qwerty: 'K', unshifted: 'า', shifted: 'ษ', hand: 'right', finger: 'r-middle' },
    { code: 'KeyL', qwerty: 'L', unshifted: 'ส', shifted: 'ศ', hand: 'right', finger: 'r-ring' },
    { code: 'Semicolon', qwerty: ';', unshifted: 'ว', shifted: 'ซ', hand: 'right', finger: 'r-pinky' },
    { code: 'Quote', qwerty: "'", unshifted: 'ง', shifted: '.', hand: 'right', finger: 'r-pinky' },
    {
      code: 'Enter',
      qwerty: 'Enter',
      unshifted: '\n',
      shifted: '\n',
      width: 2.25,
      hand: 'right',
      finger: 'r-pinky',
      isModifier: true,
      label: 'Enter',
    },
  ],
  // Row 4: Bottom Alpha Row
  [
    {
      code: 'ShiftLeft',
      qwerty: 'Shift',
      unshifted: null,
      shifted: null,
      width: 2.25,
      hand: 'left',
      finger: 'l-pinky',
      isModifier: true,
      label: 'Shift',
    },
    { code: 'KeyZ', qwerty: 'Z', unshifted: 'ผ', shifted: '(', hand: 'left', finger: 'l-pinky' },
    { code: 'KeyX', qwerty: 'X', unshifted: 'ป', shifted: ')', hand: 'left', finger: 'l-ring' },
    { code: 'KeyC', qwerty: 'C', unshifted: 'แ', shifted: 'ฉ', hand: 'left', finger: 'l-middle' },
    { code: 'KeyV', qwerty: 'V', unshifted: 'อ', shifted: 'ฮ', hand: 'left', finger: 'l-index' },
    { code: 'KeyB', qwerty: 'B', unshifted: 'ิ', shifted: 'ฺ', hand: 'left', finger: 'l-index' },
    { code: 'KeyN', qwerty: 'N', unshifted: 'ื', shifted: '์', hand: 'right', finger: 'r-index' },
    { code: 'KeyM', qwerty: 'M', unshifted: 'ท', shifted: '?', hand: 'right', finger: 'r-index' },
    { code: 'Comma', qwerty: ',', unshifted: 'ม', shifted: 'ฒ', hand: 'right', finger: 'r-middle' },
    { code: 'Period', qwerty: '.', unshifted: 'ใ', shifted: 'ฬ', hand: 'right', finger: 'r-ring' },
    { code: 'Slash', qwerty: '/', unshifted: 'ฝ', shifted: 'ฦ', hand: 'right', finger: 'r-pinky' },
    {
      code: 'ShiftRight',
      qwerty: 'Shift',
      unshifted: null,
      shifted: null,
      width: 2.75,
      hand: 'right',
      finger: 'r-pinky',
      isModifier: true,
      label: 'Shift',
    },
  ],
  // Row 5: Space Row
  [
    {
      code: 'ControlLeft',
      qwerty: 'Ctrl',
      unshifted: null,
      shifted: null,
      width: 1.5,
      hand: 'left',
      finger: 'l-pinky',
      isModifier: true,
      label: 'Ctrl',
    },
    {
      code: 'AltLeft',
      qwerty: 'Alt',
      unshifted: null,
      shifted: null,
      width: 1.5,
      hand: 'left',
      finger: 'thumb',
      isModifier: true,
      label: 'Alt',
    },
    {
      code: 'Space',
      qwerty: 'Space',
      unshifted: ' ',
      shifted: ' ',
      width: 7.5,
      hand: 'thumb',
      finger: 'thumb',
      label: 'Space',
    },
    {
      code: 'AltRight',
      qwerty: 'Alt',
      unshifted: null,
      shifted: null,
      width: 1.5,
      hand: 'right',
      finger: 'thumb',
      isModifier: true,
      label: 'Alt',
    },
    {
      code: 'ControlRight',
      qwerty: 'Ctrl',
      unshifted: null,
      shifted: null,
      width: 1.5,
      hand: 'right',
      finger: 'r-pinky',
      isModifier: true,
      label: 'Ctrl',
    },
  ],
];

export const KEDMANEE_BY_CODE: Record<string, KeyDef> = {};
for (const row of KEDMANEE_ROWS) {
  for (const key of row) {
    KEDMANEE_BY_CODE[key.code] = key;
  }
}

export interface KeyHint {
  key: KeyDef;
  shiftRequired: boolean;
  shiftCode: 'ShiftLeft' | 'ShiftRight' | null;
}

const CHAR_TO_HINT = new Map<string, KeyHint>();

for (const row of KEDMANEE_ROWS) {
  for (const key of row) {
    if (key.unshifted && !CHAR_TO_HINT.has(key.unshifted)) {
      CHAR_TO_HINT.set(key.unshifted, {
        key,
        shiftRequired: false,
        shiftCode: null,
      });
    }
    if (key.shifted && !CHAR_TO_HINT.has(key.shifted)) {
      const shiftCode = key.hand === 'left' ? 'ShiftRight' : 'ShiftLeft';
      CHAR_TO_HINT.set(key.shifted, {
        key,
        shiftRequired: true,
        shiftCode,
      });
    }
  }
}

export function findKeyForChar(char: string): KeyHint | null {
  return CHAR_TO_HINT.get(char) ?? null;
}

