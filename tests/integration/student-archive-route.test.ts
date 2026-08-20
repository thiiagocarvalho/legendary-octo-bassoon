import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../lib/permissions';

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), archiveStudent: vi.fn() }));
vi.mock('../../lib/auth', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('../../server/services/students', () => ({ archiveStudent: mocks.archiveStudent }));

import { DELETE } from '../../app/api/admin/students/[studentId]/archive/route';

describe('DELETE /api/admin/students/:studentId/archive', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects a non-administrator', async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedError('Sem permissão.'));

    await expect(DELETE(new Request('http://localhost'), { params: Promise.resolve({ studentId: 'student_1' }) }))
      .resolves.toMatchObject({ status: 403 });
    expect(mocks.archiveStudent).not.toHaveBeenCalled();
  });
});
