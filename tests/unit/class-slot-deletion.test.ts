import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: {
    classSlot: { findUnique: vi.fn() },
    enrollment: { count: vi.fn() },
    booking: { count: vi.fn() },
    $transaction: vi.fn(),
  },
  writeAuditLog: vi.fn(),
}));

vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('../../server/services/audit', () => ({ writeAuditLog: mocks.writeAuditLog }));

import { ClassSlotDeletionError, deleteClassSlot } from '../../server/services/class-slots';

describe('deleteClassSlot', () => {
  beforeEach(() => vi.resetAllMocks());

  it('impede excluir uma turma que ainda possui alunos matriculados', async () => {
    mocks.prisma.classSlot.findUnique.mockResolvedValue({ id: 'slot_1' });
    mocks.prisma.enrollment.count.mockResolvedValue(1);
    mocks.prisma.booking.count.mockResolvedValue(0);

    await expect(deleteClassSlot('slot_1', 'admin_1')).rejects.toBeInstanceOf(ClassSlotDeletionError);
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('exclui a turma vazia e suas ocorrências sem reservas', async () => {
    mocks.prisma.classSlot.findUnique.mockResolvedValue({ id: 'slot_1' });
    mocks.prisma.enrollment.count.mockResolvedValue(0);
    mocks.prisma.booking.count.mockResolvedValue(0);
    const tx = { classOccurrence: { deleteMany: vi.fn() }, classSlot: { delete: vi.fn().mockResolvedValue({ id: 'slot_1' }) } };
    mocks.prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));

    await expect(deleteClassSlot('slot_1', 'admin_1')).resolves.toEqual({ id: 'slot_1' });
    expect(tx.classOccurrence.deleteMany).toHaveBeenCalledWith({ where: { classSlotId: 'slot_1' } });
    expect(mocks.writeAuditLog).toHaveBeenCalledWith({ actorId: 'admin_1', action: 'CLASS_SLOT_DELETED', entity: 'ClassSlot', entityId: 'slot_1' });
  });
});
