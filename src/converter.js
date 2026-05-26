export function toObsidianMarkdown(parsed) {
  const fm = buildFrontmatter(parsed.properties);
  const body = renderBody(parsed.blocks);
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

// Top-level body rendering: separates transcription section from any other content.
function renderBody(blocks) {
  const sections = [];
  for (const block of blocks) {
    if (block.isStrokeData) continue;
    if (block.isTranscriptionHeader) {
      // Hoist transcription children up under a clean section header.
      sections.push('## Transcription\n');
      if (block.children && block.children.length > 0) {
        sections.push(renderBlocks(block.children, 0));
      }
    } else {
      // Generic bullet at top level (for any future non-transcription content).
      sections.push(renderBlocks([block], 0));
    }
  }
  return sections.join('\n\n');
}

function renderBlocks(blocks, depth) {
  const indent = '  '.repeat(depth);
  const lines = [];
  for (const block of blocks) {
    if (block.isStrokeData) continue;
    lines.push(`${indent}- ${cleanText(block.text)}`);
    if (block.children && block.children.length > 0) {
      lines.push(renderBlocks(block.children, depth + 1));
    }
  }
  return lines.join('\n');
}

// Strip Logseq-specific display hashtags and any bridge-internal tag noise.
function cleanText(text) {
  return text
    .replace(/\s*#Display_No_Properties\s*/g, '')
    .trim();
}
