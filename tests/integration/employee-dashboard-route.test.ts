import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ requireOperationalAccess: vi.fn(), getDashboard: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireOperationalAccess: mocks.requireOperationalAccess }));
vi.mock('../../server/services/dashboard', () => ({ getDashboard: mocks.getDashboard }));

import { GET } from '../../app/api/admin/dashboard/route';

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => vi.resetAllMocks());

  it('does not request financial metrics for an employee', async () => {
    mocks.requireOperationalAccess.mockResolvedValue({ id: 'employee_1', role: 'EMPLOYEE' });
    mocks.getDashboard.mockResolvedValue({ financial: null });

    await expect(GET()).resolves.toMatchObject({ status: 200 });
    expect(mocks.getDashboard).toHaveBeenCalledWith(expect.any(Date), { includeFinancial: false });
  });
});
