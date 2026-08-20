import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('runs TypeScript tests', () => {
    expect('pilates-crm').toContain('pilates');
  });
});
