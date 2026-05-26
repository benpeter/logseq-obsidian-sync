import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseLogseqPage } from '../src/parser.js';
import { toObsidianMarkdown } from '../src/converter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(__dirname, 'fixtures/real-logseq-page.md'), 'utf8');

describe('real logseq output from smartpen bridge', () => {
  const parsed = parseLogseqPage(sample);

  it('extracts page properties (book + page only - bridge does not write others)', () => {
    expect(parsed.properties.book).toBe('3017');
    expect(parsed.properties.page).toBe('4');
  });

  it('recognises ## Raw Stroke Data as stroke-data marker', () => {
    expect(parsed.blocks.length).toBe(1);
    const root = parsed.blocks[0];
    expect(root.text).toBe('## Raw Stroke Data');
    expect(root.isStrokeData).toBe(true);
  });

  it('captures collapsed:: true as block property', () => {
    expect(parsed.blocks[0].properties.collapsed).toBe('true');
  });

  it('parses tab-indented sub-bullets as children', () => {
    expect(parsed.blocks[0].children.length).toBe(2);
  });

  const obsidian = toObsidianMarkdown(parsed);

  it('produces YAML frontmatter with available properties + tags', () => {
    expect(obsidian).toMatch(/^---\n/);
    expect(obsidian).toMatch(/book: 3017/);
    expect(obsidian).toMatch(/page: 4/);
    expect(obsidian).toMatch(/tags: \[smartpen\]/);
  });

  it('drops all Raw Stroke Data content from Obsidian output', () => {
    expect(obsidian).not.toMatch(/Raw Stroke Data/);
    expect(obsidian).not.toMatch(/```json/);
    expect(obsidian).not.toMatch(/strokes/);
    expect(obsidian).not.toMatch(/pageInfo/);
  });
});
