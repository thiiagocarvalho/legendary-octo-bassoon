import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Tailwind content sources', () => {
  it('includes shared display helpers so attendance colors are generated', async () => {
    const config = await readFile(resolve(process.cwd(), 'tailwind.config.ts'), 'utf8');

    expect(config).toContain("'./lib/**/*.{ts,tsx}'");
  });
});
