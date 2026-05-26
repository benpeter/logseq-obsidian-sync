import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeAtomic } from '../src/writer.js';

describe('atomic writer', () => {
  let tmp;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'sync-test-')); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it('creates parent dirs and writes file', async () => {
    const target = join(tmp, 'Captures/B3017/P42.md');
    await writeAtomic(target, 'hello');
    expect(existsSync(target)).toBe(true);
    expect(readFileSync(target, 'utf8')).toBe('hello');
  });

  it('overwrites existing file atomically', async () => {
    const target = join(tmp, 'a.md');
    await writeAtomic(target, 'first');
    await writeAtomic(target, 'second');
    expect(readFileSync(target, 'utf8')).toBe('second');
  });
});
