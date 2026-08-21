import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), deleteStudent: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../server/services/students', () => ({ deleteStudent: mocks.deleteStudent }));

import { DELETE } from '../../app/api/admin/students/[studentId]/delete/route';

describe('DELETE /api/admin/students/:studentId/delete', () => {
  beforeEach(() => vi.resetAllMocks());

  it('bloqueia exclusão definitiva feita por quem não é administrador', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(DELETE(new Request('http://localhost'), { params: Promise.resolve({ studentId: 'student_1' }) }))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.deleteStudent).not.toHaveBeenCalled();
  });
});
