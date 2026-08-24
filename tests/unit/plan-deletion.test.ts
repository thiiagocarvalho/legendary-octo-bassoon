import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: { plan: { findUnique: vi.fn(), delete: vi.fn() }, enrollment: { count: vi.fn() } },
  writeAuditLog: vi.fn(),
}));

vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('../../server/services/audit', () => ({ writeAuditLog: mocks.writeAuditLog }));

import { PlanDeletionError, deletePlan } from '../../server/services/plans';

describe('deletePlan', () => {
  beforeEach(() => vi.resetAllMocks());

  it('impede excluir um plano que possui matrículas vinculadas', async () => {
    mocks.prisma.plan.findUnique.mockResolvedValue({ id: 'plan_1' });
    mocks.prisma.enrollment.count.mockResolvedValue(1);

    await expect(deletePlan('plan_1', 'admin_1')).rejects.toBeInstanceOf(PlanDeletionError);
    expect(mocks.prisma.plan.delete).not.toHaveBeenCalled();
  });

  it('exclui um plano sem matrículas vinculadas', async () => {
    mocks.prisma.plan.findUnique.mockResolvedValue({ id: 'plan_1' });
    mocks.prisma.enrollment.count.mockResolvedValue(0);
    mocks.prisma.plan.delete.mockResolvedValue({ id: 'plan_1' });

    await expect(deletePlan('plan_1', 'admin_1')).resolves.toEqual({ id: 'plan_1' });
    expect(mocks.writeAuditLog).toHaveBeenCalledWith({ actorId: 'admin_1', action: 'PLAN_DELETED', entity: 'Plan', entityId: 'plan_1' });
  });
});
