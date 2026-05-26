import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseLogseqPage } from '../src/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(__dirname, 'fixtures/sample-logseq-page.md'), 'utf8');

describe('logseq parser', () => {
  const parsed = parseLogseqPage(sample);

  it('extracts page properties', () => {
    expect(parsed.properties.book).toBe('3017');
    expect(parsed.properties.page).toBe('42');
    expect(parsed.properties.section).toBe('3');
    expect(parsed.properties.owner).toBe('1012');
    expect(parsed.properties['stroke-count']).toBe('247');
  });

  it('builds nested block tree', () => {
    expect(parsed.blocks.length).toBeGreaterThanOrEqual(2);
    const transcription = parsed.blocks.find(b => b.text === 'transcription');
    expect(transcription).toBeDefined();
    expect(transcription.children.length).toBe(2);
    expect(transcription.children[0].text).toBe('First line of writing');
    expect(transcription.children[0].children[0].text).toBe('Sub-point one');
  });

  it('strips block UUIDs from text', () => {
    const transcription = parsed.blocks.find(b => b.text === 'transcription');
    expect(transcription.text).not.toMatch(/60-aaa/);
    expect(transcription.children[0].text).not.toMatch(/60-bbb/);
  });

  it('identifies stroke-data blocks separately', () => {
    const stroke = parsed.blocks.find(b => b.text.startsWith('stroke-data::'));
    expect(stroke).toBeDefined();
    expect(stroke.isStrokeData).toBe(true);
  });
});
