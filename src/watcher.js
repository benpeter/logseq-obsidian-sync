import chokidar from 'chokidar';
import { readFile } from 'fs/promises';
import { join, relative } from 'path';
import { isSmartpenPage, parseSmartpenFilename, toObsidianRelPath } from './filename.js';
import { parseLogseqPage } from './parser.js';
import { toObsidianMarkdown } from './converter.js';
import { writeAtomic } from './writer.js';
import { loadAliases } from './aliases.js';

export async function startWatcher({ logseqPagesDir, vaultPath, stabilityThreshold = 1000, onSync = () => {} }) {
  const watcher = chokidar.watch(logseqPagesDir, {
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold,
      pollInterval: 50,
    },
    persistent: true,
  });

  async function handle(filePath) {
    const rel = relative(logseqPagesDir, filePath);
    if (!isSmartpenPage(rel)) return;
    try {
      const content = await readFile(filePath, 'utf8');
      const parsed = parseLogseqPage(content);
      const obsidianMd = toObsidianMarkdown(parsed);
      const ids = parseSmartpenFilename(rel);
      // Lazy-read aliases per event so newly edited aliases.json takes effect
      // without restarting the daemon. Reads are millisecond-scale.
      const aliases = loadAliases(vaultPath);
      const target = join(vaultPath, toObsidianRelPath(ids, aliases));
      await writeAtomic(target, obsidianMd);
      onSync({ source: filePath, target, ids });
    } catch (err) {
      console.error(`[sync] error processing ${filePath}:`, err.message);
    }
  }

  watcher.on('add', handle);
  watcher.on('change', handle);

  return watcher;
}
