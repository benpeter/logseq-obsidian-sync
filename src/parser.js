const INDENT_UNIT = 2;

export function parseLogseqPage(markdown) {
  const lines = markdown.split('\n');
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
    // Code-block boundary handling
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [line];
      } else {
        inCodeBlock = false;
        codeBuffer.push(line);
        if (currentBlock) {
          currentBlock.code = codeBuffer.join('\n');
        }
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
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
        isStrokeData: text.startsWith('stroke-data::'),
      };
      while (stack[stack.length - 1].depth >= depth) stack.pop();
      stack[stack.length - 1].children.push(block);
      stack.push(block);
      currentBlock = block;
    } else if (currentBlock) {
      // Property line under current block
      const propMatch = line.trim().match(/^([\w-]+):: (.*)$/);
      if (propMatch) {
        currentBlock.properties[propMatch[1]] = propMatch[2].trim();
      }
    }
  }

  return stack[0].children;
}
