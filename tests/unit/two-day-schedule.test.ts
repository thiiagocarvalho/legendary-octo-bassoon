import { describe, expect, it } from 'vitest';
import { classSlotInput } from '../../lib/validation/schedule';

describe('two-day class schedule validation', () => {
  it('converts Monday and Wednesday into the stored weekdays', () => {
    expect(classSlotInput.parse({ dayPair: 'MON_WED', startsTime: '08:00', duration: 60, capacity: 4 }))
      .toMatchObject({ weekday: 1, secondWeekday: 3 });
  });

  it('rejects a combination outside the two studio schedules', () => {
    expect(classSlotInput.safeParse({ dayPair: 'FRI_SAT', startsTime: '08:00', duration: 60, capacity: 4 }).success).toBe(false);
  });
});
