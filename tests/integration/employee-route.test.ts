import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireFinancialAccess: vi.fn(), createEmployee: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireFinancialAccess: mocks.requireFinancialAccess }));
vi.mock('../../server/services/employees', () => ({ createEmployee: mocks.createEmployee }));

import { POST } from '../../app/api/admin/employees/route';

describe('POST /api/admin/employees', () => {
  beforeEach(() => vi.resetAllMocks());

  it('bloqueia criação de conta de funcionária sem acesso de administrador', async () => {
    mocks.requireFinancialAccess.mockRejectedValue(new UnauthorizedError('Acesso restrito ao administrador.'));
    const request = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ fullName: 'Ana', email: 'ana@teste.com', password: 'Senha123' }) });

    await expect(POST(request)).resolves.toMatchObject({ status: 403 });
    expect(mocks.createEmployee).not.toHaveBeenCalled();
  });
});
