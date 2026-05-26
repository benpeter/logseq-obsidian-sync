export function toObsidianMarkdown(parsed) {
  const fm = buildFrontmatter(parsed.properties);
  const body = renderBlocks(parsed.blocks.filter(b => !b.isStrokeData), 0);
  return `${fm}\n\n${body}\n`;
}

function buildFrontmatter(properties) {
  const lines = ['---'];
  const order = ['book', 'page', 'section', 'owner', 'timestamp', 'stroke-count'];
  for (const key of order) {
    if (properties[key] !== undefined) {
      lines.push(`${key}: ${properties[key]}`);
    }
  }
  lines.push('tags: [smartpen]');
  lines.push('---');
  return lines.join('\n');
}

function renderBlocks(blocks, depth) {
  const indent = '  '.repeat(depth);
  const lines = [];
  for (const block of blocks) {
    if (block.isStrokeData) continue;
    lines.push(`${indent}- ${block.text}`);
    if (block.children && block.children.length > 0) {
      lines.push(renderBlocks(block.children, depth + 1));
    }
  }
  return lines.join('\n');
}
