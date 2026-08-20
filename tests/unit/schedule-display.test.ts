import { describe, expect, it } from 'vitest';
import { weekdayLabel } from '../../lib/schedule-display';

describe('weekdayLabel', () => {
  it('shows the Portuguese weekday for a class slot', () => {
    expect(weekdayLabel(3)).toBe('Quarta-feira');
  });
});
