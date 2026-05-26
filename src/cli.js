#!/usr/bin/env node
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { startWatcher } from './watcher.js';

const logseqGraph = process.env.LOGSEQ_GRAPH || join(homedir(), 'LogseqGraph');
const vaultPath = process.env.OBSIDIAN_VAULT || join(homedir(), 'vault');

const logseqPagesDir = join(logseqGraph, 'pages');

if (!existsSync(logseqPagesDir)) {
  console.error(`[sync] Logseq pages dir not found: ${logseqPagesDir}`);
  process.exit(1);
}

if (!existsSync(vaultPath)) {
  console.error(`[sync] Vault not found: ${vaultPath}`);
  process.exit(1);
}

console.log(`[sync] watching ${logseqPagesDir}`);
console.log(`[sync] writing to ${vaultPath}/_org/Notebooks/`);

const watcher = await startWatcher({
  logseqPagesDir,
  vaultPath,
  onSync: ({ ids, target }) => {
    console.log(`[sync] B${ids.book}/P${ids.page} -> ${target}`);
  },
});

process.on('SIGTERM', async () => {
  console.log('[sync] shutting down');
  await watcher.close();
  process.exit(0);
});
