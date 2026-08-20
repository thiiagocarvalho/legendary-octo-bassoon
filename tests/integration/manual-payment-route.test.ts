import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  recordManualPayment: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../lib/db', () => ({ prisma: { manualPayment: { findMany: vi.fn() } } }));
vi.mock('../../server/services/manual-payments', () => ({ recordManualPayment: mocks.recordManualPayment }));

import { POST } from '../../app/api/admin/manual-payments/route';

describe('POST /api/admin/manual-payments', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 403 instead of treating a student as an invalid payment', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(POST(new Request('http://localhost/api/admin/manual-payments', { method: 'POST', body: '{}' })))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.recordManualPayment).not.toHaveBeenCalled();
  });
});
