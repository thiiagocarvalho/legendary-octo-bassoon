import { describe, expect, it } from 'vitest';
import { bookingChangeNotification } from '../../server/services/booking-change-notification';

describe('booking change notification', () => {
  it('describes the previous and new date and time for the administrator', () => {
    const message = bookingChangeNotification(
      new Date('2026-08-24T13:00:00.000Z'),
      new Date('2026-08-26T14:00:00.000Z'),
    );

    expect(message).toContain('Remarcação de aula');
    expect(message).toContain('24/08/2026');
    expect(message).toContain('26/08/2026');
  });
});
