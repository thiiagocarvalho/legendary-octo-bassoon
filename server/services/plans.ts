import { prisma } from '../../lib/db';
import { writeAuditLog } from './audit';

export class PlanDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanDeletionError';
  }
}

export async function deletePlan(planId: string, actorId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { id: true } });
  if (!plan) throw new PlanDeletionError('Plano não encontrado.');

  const enrollmentCount = await prisma.enrollment.count({ where: { planId } });
  if (enrollmentCount > 0) {
    throw new PlanDeletionError('Não é possível excluir este plano porque ele possui alunos ou registros financeiros vinculados.');
  }

  const deleted = await prisma.plan.delete({ where: { id: planId } });
  await writeAuditLog({ actorId, action: 'PLAN_DELETED', entity: 'Plan', entityId: deleted.id });
  return deleted;
}
