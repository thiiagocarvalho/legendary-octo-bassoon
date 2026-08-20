import { describe, expect, it } from 'vitest';
import { healthHistoryData } from '../../server/services/health-history';

describe('health profile history', () => {
  it('copies the consented clinical fields into an immutable history entry', () => {
    expect(healthHistoryData({ consentedAt: new Date('2026-08-20'), restrictions: 'Evitar impacto', goals: 'Mobilidade' }, 'admin-1')).toMatchObject({ actorId: 'admin-1', restrictions: 'Evitar impacto', goals: 'Mobilidade' });
  });
});
