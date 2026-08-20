import { describe, expect, it } from 'vitest';
import { bookingStatusLabel } from '../../lib/booking-labels';

describe('student portal labels', () => {
  it('shows attendance in Portuguese', () => {
    expect(bookingStatusLabel('PRESENT')).toBe('Presente');
  });
});
