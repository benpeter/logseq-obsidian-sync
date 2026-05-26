import { notebookFolder } from './aliases.js';

const SMARTPEN_RE = /^(?:Smartpen Data|smartpen)___B(\d+)___P(\d+)\.md$/i;

export function isSmartpenPage(relPath) {
  const filename = relPath.split('/').pop();
  return SMARTPEN_RE.test(filename);
}

export function parseSmartpenFilename(relPath) {
  const filename = relPath.split('/').pop();
  const m = filename.match(SMARTPEN_RE);
  if (!m) return null;
  return { book: parseInt(m[1], 10), page: parseInt(m[2], 10) };
}

export function toObsidianRelPath({ book, page }, aliases = {}) {
  const folder = notebookFolder(book, aliases);
  // When the folder is an alias, multiple Ncode book IDs may map to the same
  // physical notebook, so page numbers can collide. Prefix the filename with
  // the book ID to keep pages unambiguous. When the folder is the default
  // `B<book>` form, the book is already in the folder name — leave the file
  // as plain `P<page>.md`.
  const isAliased = folder !== `B${book}`;
  const filename = isAliased ? `B${book}-P${page}.md` : `P${page}.md`;
  return `_org/Notebooks/${folder}/${filename}`;
}
