import { describe, expect, it } from 'vitest';
import { dailyMarketingAction } from '../../lib/daily-marketing-action';

describe('dailyMarketingAction', () => {
  it('returns a practical action for each weekday', () => {
    expect(dailyMarketingAction(new Date(2026, 7, 24)).title).toBe('Mostre uma conquista');
  });
});
