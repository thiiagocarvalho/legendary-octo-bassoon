import { describe, expect, it } from 'vitest';
import { weekdayLabel, weekdayPairLabel } from '../../lib/schedule-display';

describe('weekdayLabel', () => {
  it('shows the Portuguese weekday for a class slot', () => {
    expect(weekdayLabel(3)).toBe('Quarta-feira');
  });
});

describe('weekdayPairLabel', () => {
  it('shows the two allowed studio day pairs', () => {
    expect(weekdayPairLabel(1, 3)).toBe('Segunda e Quarta');
    expect(weekdayPairLabel(2, 4)).toBe('Terça e Quinta');
  });
});
