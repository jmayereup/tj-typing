import { findKeyForChar } from '../data/kedmaneeLayout';

const COMBINING_MARKS_REGEX = /^[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]$/;

/**
 * Normalizes Thai text so every character maps cleanly to a single Kedmanee keystroke.
 * - Replaces Nikhahit + Sara Aa (\u0E4D\u0E32) with Sara Am (\u0E33, ำ)
 * - Replaces double Sara E (\u0E40\u0E40) with Sara Ae (\u0E41, แ)
 * - Collapses runs of whitespace/newlines into single spaces
 */
export function normalizeThaiText(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\u0E4D\u0E32/g, '\u0E33')
    .replace(/\u0E40\u0E40/g, '\u0E41')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCombiningMark(char: string): boolean {
  return COMBINING_MARKS_REGEX.test(char);
}

/**
 * Formats a single character for display in a hint badge.
 * Combining marks are prefixed with dotted circle (◌) so they remain legible.
 */
export function formatCharPreview(char: string): string {
  if (char === ' ') return 'Space';
  if (char === '\n') return 'Enter';
  if (isCombiningMark(char)) return `◌${char}`;
  return char;
}

/**
 * Returns unique characters in the text that cannot be typed on a standard Kedmanee layout.
 */
export function findUnsupportedChars(text: string): string[] {
  const unsupported = new Set<string>();
  for (const char of Array.from(text)) {
    if (!findKeyForChar(char)) {
      unsupported.add(char);
    }
  }
  return Array.from(unsupported);
}

export interface GraphemeCluster {
  text: string;
  startIndex: number;
  endIndex: number; // exclusive code-unit index in Array.from(text)
}

/**
 * Segments Thai text into visual grapheme clusters while tracking their
 * code-point indices so combining marks stay attached to their base consonant.
 */
export function segmentThaiGraphemes(text: string): GraphemeCluster[] {
  const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
  const clusters: GraphemeCluster[] = [];
  let cpIndex = 0;

  for (const seg of segmenter.segment(text)) {
    const len = Array.from(seg.segment).length;
    clusters.push({
      text: seg.segment,
      startIndex: cpIndex,
      endIndex: cpIndex + len,
    });
    cpIndex += len;
  }

  return clusters;
}

