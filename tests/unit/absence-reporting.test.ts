import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ prisma: { $transaction: vi.fn() } }));
vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));

import { reportAbsenceAndCreateMakeup } from '../../server/services/bookings';

describe('reportAbsenceAndCreateMakeup', () => {
  beforeEach(() => vi.resetAllMocks());

  it('libera a vaga e cria o crédito de reposição assim que o aluno avisa a falta', async () => {
    const startsAt = new Date('2026-08-26T14:00:00Z');
    const tx = {
      booking: { findFirst: vi.fn().mockResolvedValue({ id: 'booking_1', occurrence: { startsAt } }), update: vi.fn().mockResolvedValue({ id: 'booking_1' }) },
      auditLog: { count: vi.fn().mockResolvedValue(0), create: vi.fn() },
      makeupCredit: { create: vi.fn().mockResolvedValue({ id: 'credit_1' }) },
      studentMessage: { create: vi.fn() },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    await expect(reportAbsenceAndCreateMakeup('student_1', 'booking_1', new Date('2026-08-24T12:00:00Z'))).resolves.toEqual({ id: 'credit_1' });
    expect(tx.booking.update).toHaveBeenCalledWith({ where: { id: 'booking_1' }, data: { status: 'CANCELED' } });
    expect(tx.makeupCredit.create).toHaveBeenCalledWith({ data: { studentId: 'student_1', sourceBookingId: 'booking_1' } });
  });
});
