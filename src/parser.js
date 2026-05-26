const INDENT_UNIT = 2;

// Logseq writes sub-bullets with tab indentation (1 tab = 1 level).
// Normalize each leading tab to 2 spaces so depth math is uniform.
function normalizeIndent(line) {
  let i = 0;
  while (i < line.length && line[i] === '\t') i++;
  return '  '.repeat(i) + line.slice(i);
}

export function parseLogseqPage(markdown) {
  const lines = markdown.split('\n').map(normalizeIndent);
  const properties = {};
  let i = 0;

  // Page properties: `key:: value` lines before first bullet
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('-')) break;
    const m = line.match(/^([\w-]+):: (.*)$/);
    if (m) properties[m[1]] = m[2].trim();
    i++;
  }

  // Block tree
  const blocks = parseBlocks(lines.slice(i));
  return { properties, blocks };
}

function parseBlocks(lines) {
  const stack = [{ depth: -1, children: [] }];
  let currentBlock = null;
  let inCodeBlock = false;
  let codeBuffer = [];

  for (const line of lines) {
    // Inside an open code block: accumulate lines until closing fence
    if (inCodeBlock) {
      const trimmed = line.trim();
      codeBuffer.push(line);
      if (trimmed === '```') {
        if (currentBlock) currentBlock.code = codeBuffer.join('\n');
        codeBuffer = [];
        inCodeBlock = false;
      }
      continue;
    }

    const bulletMatch = line.match(/^(\s*)- (.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const text = bulletMatch[2].trim();
      const depth = Math.floor(indent / INDENT_UNIT);
      const block = {
        text,
        depth,
        children: [],
        properties: {},
        // Drop signals from the bridge:
        //  - Current bridge (v1.3+): top-level bullet text "## Raw Stroke Data"
        //  - Older bridge / synthetic fixtures: bullet prefixed with "stroke-data::"
        isStrokeData: text.startsWith('## Raw Stroke Data') || text.startsWith('stroke-data::'),
      };
      while (stack[stack.length - 1].depth >= depth) stack.pop();
      stack[stack.length - 1].children.push(block);
      stack.push(block);
      currentBlock = block;

      // Bridge writes code blocks as a bullet whose text is the opening fence,
      // followed by indented continuation lines, then a closing-fence line.
      if (text.startsWith('```') && text.length > 3) {
        inCodeBlock = true;
        codeBuffer = [text];
      }
      continue;
    }

    if (currentBlock) {
      const trimmed = line.trim();
      // Standalone code-fence opener (older format / synthetic fixtures)
      if (trimmed.startsWith('```')) {
        inCodeBlock = true;
        codeBuffer = [line];
        continue;
      }
      // Property line under current block
      const propMatch = trimmed.match(/^([\w-]+):: (.*)$/);
      if (propMatch) {
        currentBlock.properties[propMatch[1]] = propMatch[2].trim();
      }
    }
  }

  return stack[0].children;
}
