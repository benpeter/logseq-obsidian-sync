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

  it('maps to Obsidian relative path under _org/Notebooks by default', () => {
    expect(toObsidianRelPath({book: 3017, page: 42})).toBe('_org/Notebooks/B3017/P42.md');
  });

  it('uses alias folder + B<book>-P<page>.md when alias is present', () => {
    expect(toObsidianRelPath({book: 3017, page: 42}, {'3017': 'Journal 2026'}))
      .toBe('_org/Notebooks/Journal 2026/B3017-P42.md');
  });

  it('keeps both books separate within same alias (no page collision)', () => {
    const aliases = {'3017': 'Journal 2026', '2249': 'Journal 2026'};
    expect(toObsidianRelPath({book: 3017, page: 4}, aliases))
      .toBe('_org/Notebooks/Journal 2026/B3017-P4.md');
    expect(toObsidianRelPath({book: 2249, page: 4}, aliases))
      .toBe('_org/Notebooks/Journal 2026/B2249-P4.md');
  });

  it('falls back to B<book>/P<page>.md when alias map does not include the book', () => {
    expect(toObsidianRelPath({book: 9999, page: 1}, {'3017': 'Other'}))
      .toBe('_org/Notebooks/B9999/P1.md');
  });
});
