import { describe, expect, it } from 'vitest';
import { percentage } from '../../server/services/dashboard-metrics';

describe('dashboard metrics', () => {
  it('returns zero when an occupancy denominator is empty', () => {
    expect(percentage(0, 0)).toBe(0);
  });

  it('rounds occupancy and attendance to the nearest whole percentage', () => {
    expect(percentage(5, 8)).toBe(63);
  });
});
