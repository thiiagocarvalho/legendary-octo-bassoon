import { describe, expect, it } from 'vitest';
import { formatBirthdayDayMonth } from '../../lib/birthday-display';

describe('formatBirthdayDayMonth', () => {
  it('shows the birthday day and month without timezone shifts', () => {
    expect(formatBirthdayDayMonth('1990-08-25T00:00:00.000Z')).toBe('25/08');
  });
});
