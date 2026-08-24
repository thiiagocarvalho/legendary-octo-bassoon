import { prisma, type TransactionClient } from '../../lib/db';
import { writeAuditLog } from './audit';

export class ClassSlotDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClassSlotDeletionError';
  }
}

export async function deleteClassSlot(classSlotId: string, actorId: string) {
  const slot = await prisma.classSlot.findUnique({ where: { id: classSlotId }, select: { id: true } });
  if (!slot) throw new ClassSlotDeletionError('Turma não encontrada.');

  const [enrollmentCount, bookingCount] = await Promise.all([
    prisma.enrollment.count({ where: { classSlotId } }),
    prisma.booking.count({ where: { occurrence: { classSlotId } } }),
  ]);
  if (enrollmentCount > 0 || bookingCount > 0) {
    throw new ClassSlotDeletionError('Não é possível excluir esta turma enquanto houver alunos matriculados ou aulas registradas.');
  }

  const deleted = await prisma.$transaction(async (tx: TransactionClient) => {
    await tx.classOccurrence.deleteMany({ where: { classSlotId } });
    return tx.classSlot.delete({ where: { id: classSlotId } });
  });
  await writeAuditLog({ actorId, action: 'CLASS_SLOT_DELETED', entity: 'ClassSlot', entityId: deleted.id });
  return deleted;
}
