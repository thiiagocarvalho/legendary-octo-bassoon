import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireOperationalAccess: vi.fn(),
  prisma: {
    classOccurrence: { findUnique: vi.fn() },
    enrollment: { findFirst: vi.fn() },
    booking: { upsert: vi.fn() },
  },
  writeAuditLog: vi.fn(),
}));
vi.mock('../../lib/auth', () => ({ requireOperationalAccess: mocks.requireOperationalAccess }));
vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('../../server/services/audit', () => ({ writeAuditLog: mocks.writeAuditLog }));

import { POST } from '../../app/api/admin/attendance/route';

describe('rotas operacionais para funcionária', () => {
  beforeEach(() => vi.resetAllMocks());

  it('permite registrar a presença de aluno da turma', async () => {
    mocks.requireOperationalAccess.mockResolvedValue({ id: 'employee_1', role: 'EMPLOYEE' });
    mocks.prisma.classOccurrence.findUnique.mockResolvedValue({ classSlotId: 'slot_1' });
    mocks.prisma.enrollment.findFirst.mockResolvedValue({ id: 'enrollment_1' });
    mocks.prisma.booking.upsert.mockResolvedValue({ id: 'booking_1', status: 'PRESENT' });

    await expect(POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ occurrenceId: 'occurrence_1', studentId: 'student_1', status: 'PRESENT' }) }))).resolves.toMatchObject({ status: 200 });
    expect(mocks.writeAuditLog).toHaveBeenCalledWith(expect.objectContaining({ actorId: 'employee_1' }));
  });
});
