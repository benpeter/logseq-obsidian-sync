import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { toObsidianMarkdown } from '../src/converter.js';
import { parseLogseqPage } from '../src/parser.js';

describe('obsidian converter', () => {
  const parsed = {
    properties: {
      book: '3017', page: '42', section: '3', owner: '1012',
      timestamp: '2026-05-26T10:00:00Z', 'stroke-count': '247',
    },
    blocks: [
      { text: 'transcription', depth: 0, children: [
        { text: 'First line', depth: 1, children: [
          { text: 'Sub one', depth: 2, children: [], isStrokeData: false },
        ], isStrokeData: false },
      ], isStrokeData: false, properties: {} },
      { text: 'stroke-data:: chunk-0', depth: 0, children: [], isStrokeData: true,
        code: '```json\n[]\n```' },
    ],
  };

  const md = toObsidianMarkdown(parsed);

  it('produces YAML frontmatter from page properties', () => {
    expect(md).toMatch(/^---\n/);
    expect(md).toMatch(/book: 3017/);
    expect(md).toMatch(/page: 42/);
    expect(md).toMatch(/section: 3/);
    expect(md).toMatch(/timestamp: 2026-05-26T10:00:00Z/);
    expect(md).toMatch(/stroke-count: 247/);
  });

  it('preserves bullet hierarchy', () => {
    expect(md).toMatch(/- transcription/);
    expect(md).toMatch(/  - First line/);
    expect(md).toMatch(/    - Sub one/);
  });

  it('drops stroke-data blocks entirely', () => {
    expect(md).not.toMatch(/stroke-data/);
    expect(md).not.toMatch(/```json/);
  });

  it('includes a tag', () => {
    expect(md).toMatch(/tags: \[smartpen\]/);
  });
});

describe('parser + converter integration', () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sample = readFileSync(join(__dirname, 'fixtures/sample-logseq-page.md'), 'utf8');
  const md = toObsidianMarkdown(parseLogseqPage(sample));

  it('round-trip output has expected structure', () => {
    expect(md).toMatch(/^---\nbook: 3017/);
    expect(md).toMatch(/- transcription/);
    expect(md).toMatch(/    - Sub-point one/);
    expect(md).not.toMatch(/60-aaa/);
    expect(md).not.toMatch(/```json/);
    expect(md).not.toMatch(/id:: /);
  });
});
