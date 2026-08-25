import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireFinancialAccess: vi.fn(), prisma: { plan: { findMany: vi.fn(), create: vi.fn() }, manualPayment: { findMany: vi.fn() } } }));
vi.mock('../../lib/auth', () => ({ requireFinancialAccess: mocks.requireFinancialAccess }));
vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('../../server/services/manual-payments', () => ({ recordManualPayment: vi.fn() }));

import { GET as getPlans } from '../../app/api/admin/plans/route';
import { POST as createPayment } from '../../app/api/admin/manual-payments/route';

describe('rotas financeiras', () => {
  beforeEach(() => vi.resetAllMocks());

  it('recusa pagamentos de uma funcionária', async () => {
    mocks.requireFinancialAccess.mockRejectedValue(new UnauthorizedError('Acesso restrito ao administrador.'));

    await expect(createPayment(new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) }))).resolves.toMatchObject({ status: 403 });
  });

  it('recusa a consulta de planos de uma funcionária', async () => {
    mocks.requireFinancialAccess.mockRejectedValue(new UnauthorizedError('Acesso restrito ao administrador.'));

    await expect(getPlans()).resolves.toMatchObject({ status: 403 });
    expect(mocks.prisma.plan.findMany).not.toHaveBeenCalled();
  });
});
