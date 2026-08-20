import { describe, expect, it } from 'vitest';
import { healthProfileInput } from '../../lib/validation/students';

describe('health profile validation', () => {
  it('requires explicit consent before storing restrictions', () => {
    const result = healthProfileInput.safeParse({ restrictions: 'Evitar flexão profunda.' });
    expect(result.success).toBe(false);
  });

  it('accepts a consented profile with restrictions', () => {
    const result = healthProfileInput.safeParse({
      consentedAt: '2026-08-20T10:00:00.000Z',
      restrictions: 'Evitar flexão profunda.',
    });
    expect(result.success).toBe(true);
  });
});
