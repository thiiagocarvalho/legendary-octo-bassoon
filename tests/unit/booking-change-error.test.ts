import { describe, expect, it } from 'vitest';
import { bookingChangeError } from '../../lib/booking-change-error';

describe('bookingChangeError', () => {
  it('explica quando o aluno excedeu as duas trocas mensais', () => {
    expect(bookingChangeError({ error: 'MONTHLY_CHANGE_LIMIT_REACHED' })).toBe('Você já excedeu o limite de 2 mudanças mensais.');
  });
});
