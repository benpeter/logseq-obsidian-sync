import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const NOTEBOOKS_DIR = '_org/Notebooks';
const ALIASES_FILENAME = '.aliases.json';

// Read the alias map from `<vault>/_org/Notebooks/.aliases.json`.
// Returns {} if file missing, unreadable, or malformed — never throws.
// Lazy-read on every sync event keeps the watcher simple; reload is automatic.
export function loadAliases(vaultPath) {
  const path = join(vaultPath, NOTEBOOKS_DIR, ALIASES_FILENAME);
  if (!existsSync(path)) return {};
  try {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

// Filesystem-safe folder name. Replace path separators and trim;
// otherwise trust the user-provided value.
export function sanitizeAlias(name) {
  return String(name).replace(/[/\\]/g, '_').trim();
}

// Pick the folder name for a book: alias if mapped, otherwise B<book>.
export function notebookFolder(book, aliases) {
  const alias = aliases?.[String(book)];
  if (alias) return sanitizeAlias(alias);
  return `B${book}`;
}
