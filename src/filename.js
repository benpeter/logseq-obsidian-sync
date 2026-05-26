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

export function toObsidianRelPath({ book, page }) {
  return `_org/Books/B${book}/P${page}.md`;
}
