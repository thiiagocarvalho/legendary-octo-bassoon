import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), deletePlan: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../server/services/plans', () => ({ deletePlan: mocks.deletePlan, PlanDeletionError: class PlanDeletionError extends Error {} }));

import { DELETE } from '../../app/api/admin/plans/[planId]/route';

describe('DELETE /api/admin/plans/:planId', () => {
  beforeEach(() => vi.resetAllMocks());

  it('bloqueia a exclusão feita por quem não é administrador', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(DELETE(new Request('http://localhost'), { params: Promise.resolve({ planId: 'plan_1' }) }))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.deletePlan).not.toHaveBeenCalled();
  });
});
