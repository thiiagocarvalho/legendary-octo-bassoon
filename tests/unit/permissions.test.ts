import { describe, expect, it } from 'vitest';
import { canReadHealthProfile, requireRole, UnauthorizedError } from '../../lib/permissions';

describe('clinical-data permission', () => {
  it('allows only an administrator', () => {
    expect(canReadHealthProfile({ role: 'ADMIN' })).toBe(true);
    expect(canReadHealthProfile({ role: 'STUDENT', studentId: 'student-1' })).toBe(false);
  });
});

describe('role guard', () => {
  it('rejects an unauthenticated request', () => {
    expect(() => requireRole(null, 'ADMIN')).toThrow(UnauthorizedError);
  });

  it('rejects a student from an administrator-only operation', () => {
    expect(() => requireRole({ id: 'user-1', role: 'STUDENT', studentId: 'student-1' }, 'ADMIN'))
      .toThrow(UnauthorizedError);
  });
});
