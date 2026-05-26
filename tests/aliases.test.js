import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadAliases, sanitizeAlias, notebookFolder } from '../src/aliases.js';

describe('aliases', () => {
  let vault;
  beforeEach(() => { vault = mkdtempSync(join(tmpdir(), 'vault-')); });
  afterEach(() => { rmSync(vault, { recursive: true, force: true }); });

  describe('loadAliases', () => {
    it('returns {} when file missing', () => {
      expect(loadAliases(vault)).toEqual({});
    });

    it('reads and parses the alias map', () => {
      mkdirSync(join(vault, '_org/Notebooks'), { recursive: true });
      writeFileSync(join(vault, '_org/Notebooks/.aliases.json'),
        JSON.stringify({ '3017': 'Journal 2026' }));
      expect(loadAliases(vault)).toEqual({ '3017': 'Journal 2026' });
    });

    it('returns {} on malformed JSON instead of throwing', () => {
      mkdirSync(join(vault, '_org/Notebooks'), { recursive: true });
      writeFileSync(join(vault, '_org/Notebooks/.aliases.json'), '{not json');
      expect(loadAliases(vault)).toEqual({});
    });

    it('rejects non-object JSON (arrays, primitives)', () => {
      mkdirSync(join(vault, '_org/Notebooks'), { recursive: true });
      writeFileSync(join(vault, '_org/Notebooks/.aliases.json'), '["nope"]');
      expect(loadAliases(vault)).toEqual({});
    });
  });

  describe('sanitizeAlias', () => {
    it('replaces slashes with underscores', () => {
      expect(sanitizeAlias('a/b\\c')).toBe('a_b_c');
    });
    it('trims whitespace', () => {
      expect(sanitizeAlias('  Journal 2026  ')).toBe('Journal 2026');
    });
  });

  describe('notebookFolder', () => {
    it('uses alias when present', () => {
      expect(notebookFolder(3017, { '3017': 'Journal 2026' })).toBe('Journal 2026');
    });
    it('falls back to B<book> when no alias', () => {
      expect(notebookFolder(9999, { '3017': 'Other' })).toBe('B9999');
    });
    it('handles missing aliases param', () => {
      expect(notebookFolder(3017, undefined)).toBe('B3017');
      expect(notebookFolder(3017, null)).toBe('B3017');
    });
  });
});
