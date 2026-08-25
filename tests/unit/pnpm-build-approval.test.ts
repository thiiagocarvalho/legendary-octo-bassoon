import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('pnpm build-script approvals', () => {
  it('approves the build scripts required by the production dependencies', async () => {
    const workspace = await readFile(new URL('../../pnpm-workspace.yaml', import.meta.url), 'utf8');

    for (const packageName of [
      '@prisma/client',
      '@prisma/engines',
      'prisma',
      'esbuild',
      'sharp',
      'unrs-resolver',
    ]) {
      const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(workspace).toMatch(new RegExp(`^\\s*'?${escapedName}'?: true$`, 'm'));
    }
  });
});
