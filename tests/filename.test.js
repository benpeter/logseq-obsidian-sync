import { describe, it, expect } from 'vitest';
import { isSmartpenPage, parseSmartpenFilename, toObsidianRelPath } from '../src/filename.js';

describe('filename matcher', () => {
  it('recognises smartpen pages', () => {
    expect(isSmartpenPage('smartpen___B3017___P42.md')).toBe(true);
    expect(isSmartpenPage('smartpen Data___B3017___P42.md')).toBe(true);
    expect(isSmartpenPage('journals/2026_05_26.md')).toBe(false);
    expect(isSmartpenPage('random-note.md')).toBe(false);
  });

  it('parses book and page', () => {
    expect(parseSmartpenFilename('smartpen___B3017___P42.md')).toEqual({
      book: 3017, page: 42
    });
    expect(parseSmartpenFilename('Smartpen Data___B3017___P42.md')).toEqual({
      book: 3017, page: 42
    });
  });

  it('returns null for non-smartpen', () => {
    expect(parseSmartpenFilename('journals/2026_05_26.md')).toBeNull();
  });

  it('maps to Obsidian relative path', () => {
    expect(toObsidianRelPath({book: 3017, page: 42})).toBe('Captures/B3017/P42.md');
  });
});
