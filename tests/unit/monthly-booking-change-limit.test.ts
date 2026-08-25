import { describe, expect, it } from 'vitest';
import { monthlyBookingChangeDecision } from '../../server/services/monthly-booking-change-limit';

describe('monthlyBookingChangeDecision', () => {
  it('bloqueia a terceira troca de aula no mesmo mês', () => {
    expect(monthlyBookingChangeDecision(2)).toEqual({ allowed: false, code: 'MONTHLY_CHANGE_LIMIT_REACHED' });
  });

  it('permite as duas primeiras trocas mensais', () => {
    expect(monthlyBookingChangeDecision(1)).toEqual({ allowed: true });
  });
});
