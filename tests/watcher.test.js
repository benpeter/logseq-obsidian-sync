import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { startWatcher } from '../src/watcher.js';

describe('watcher', () => {
  let logseqDir, vaultDir, watcher;

  beforeEach(() => {
    logseqDir = mkdtempSync(join(tmpdir(), 'logseq-'));
    vaultDir = mkdtempSync(join(tmpdir(), 'vault-'));
    mkdirSync(join(logseqDir, 'pages'), { recursive: true });
  });

  afterEach(async () => {
    if (watcher) await watcher.close();
    rmSync(logseqDir, { recursive: true, force: true });
    rmSync(vaultDir, { recursive: true, force: true });
  });

  it('mirrors a new smartpen page to the vault', async () => {
    watcher = await startWatcher({
      logseqPagesDir: join(logseqDir, 'pages'),
      vaultPath: vaultDir,
      stabilityThreshold: 100, // ms
    });

    const filename = join(logseqDir, 'pages', 'smartpen___B3017___P42.md');
    writeFileSync(filename, [
      'book:: 3017',
      'page:: 42',
      'section:: 3',
      'owner:: 1012',
      'timestamp:: 2026-05-26T10:00:00Z',
      'stroke-count:: 1',
      '',
      '- transcription',
      '  - Hello world',
    ].join('\n'));

    await new Promise(r => setTimeout(r, 600));

    const target = join(vaultDir, '_org/Books/B3017/P42.md');
    expect(existsSync(target)).toBe(true);
    const content = readFileSync(target, 'utf8');
    expect(content).toMatch(/book: 3017/);
    expect(content).toMatch(/- transcription/);
    expect(content).toMatch(/  - Hello world/);
  });

  it('ignores non-smartpen file changes', async () => {
    watcher = await startWatcher({
      logseqPagesDir: join(logseqDir, 'pages'),
      vaultPath: vaultDir,
      stabilityThreshold: 100,
    });

    writeFileSync(join(logseqDir, 'pages', 'random.md'), 'unrelated');
    await new Promise(r => setTimeout(r, 600));

    expect(existsSync(join(vaultDir, '_org'))).toBe(false);
  });
});
