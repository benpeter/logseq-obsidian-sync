import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { startWatcher } from '../src/watcher.js';

describe('watcher robustness', () => {
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

  it('does not crash on malformed page', async () => {
    watcher = await startWatcher({
      logseqPagesDir: join(logseqDir, 'pages'),
      vaultPath: vaultDir,
      stabilityThreshold: 100,
    });
    writeFileSync(join(logseqDir, 'pages', 'smartpen___B1___P1.md'),
      'not valid logseq content at all just garbage');
    await new Promise(r => setTimeout(r, 600));
    expect(existsSync(join(vaultDir, '_org/Notebooks/B1/P1.md'))).toBe(true);
  });
});
