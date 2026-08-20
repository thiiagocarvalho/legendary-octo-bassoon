import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), materializeOccurrences: vi.fn(), prisma: { classSlot: { findUnique: vi.fn(), update: vi.fn() } } }));
vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('../../server/services/occurrences', () => ({ materializeOccurrences: mocks.materializeOccurrences }));

import { PATCH } from '../../app/api/admin/class-slots/[classSlotId]/day-pair/route';

describe('PATCH /api/admin/class-slots/:classSlotId/day-pair', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects a non-administrator', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(PATCH(new Request('http://localhost', { method: 'PATCH', body: JSON.stringify({ dayPair: 'MON_WED' }) }), { params: Promise.resolve({ classSlotId: 'slot_1' }) }))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.prisma.classSlot.update).not.toHaveBeenCalled();
  });
});
