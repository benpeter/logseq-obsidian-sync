import { writeFile, mkdir, rename } from 'fs/promises';
import { dirname } from 'path';
import { randomBytes } from 'crypto';

export async function writeAtomic(targetPath, content) {
  await mkdir(dirname(targetPath), { recursive: true });
  const tmpPath = `${targetPath}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(tmpPath, content, 'utf8');
  await rename(tmpPath, targetPath);
}
