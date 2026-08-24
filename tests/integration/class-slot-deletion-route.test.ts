import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), deleteClassSlot: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../server/services/class-slots', () => ({ deleteClassSlot: mocks.deleteClassSlot, ClassSlotDeletionError: class ClassSlotDeletionError extends Error {} }));

import { DELETE } from '../../app/api/admin/class-slots/[classSlotId]/route';

describe('DELETE /api/admin/class-slots/:classSlotId', () => {
  beforeEach(() => vi.resetAllMocks());

  it('bloqueia a exclusão feita por quem não é administrador', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(DELETE(new Request('http://localhost'), { params: Promise.resolve({ classSlotId: 'slot_1' }) }))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.deleteClassSlot).not.toHaveBeenCalled();
  });
});
