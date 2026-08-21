import { describe, expect, it } from 'vitest';
import { monthlyForecastCents, percentage } from '../../server/services/dashboard-metrics';

describe('dashboard metrics', () => {
  it('returns zero when an occupancy denominator is empty', () => {
    expect(percentage(0, 0)).toBe(0);
  });

  it('rounds occupancy and attendance to the nearest whole percentage', () => {
    expect(percentage(5, 8)).toBe(63);
  });

  it('sums the monthly prices of all non-cancelled enrollments for the forecast', () => {
    expect(monthlyForecastCents([
      { plan: { monthlyPriceCents: 35000 } },
      { plan: { monthlyPriceCents: 42000 } },
    ])).toBe(77000);
  });
});
