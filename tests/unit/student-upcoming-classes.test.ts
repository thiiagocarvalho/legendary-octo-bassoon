import { describe, expect, it } from 'vitest';
import { studentUpcomingClasses } from '../../lib/student-upcoming-classes';

describe('studentUpcomingClasses', () => {
  it('mostra somente as ocorrências que o aluno reservou, em ordem de data', () => {
    const classes = studentUpcomingClasses([
      { id: 'free', startsAt: '2026-08-29T15:00:00.000Z', bookingId: null },
      { id: 'later', startsAt: '2026-08-30T15:00:00.000Z', bookingId: 'booking_2' },
      { id: 'next', startsAt: '2026-08-28T15:00:00.000Z', bookingId: 'booking_1' },
    ]);

    expect(classes.map((item) => item.id)).toEqual(['next', 'later']);
  });
});
