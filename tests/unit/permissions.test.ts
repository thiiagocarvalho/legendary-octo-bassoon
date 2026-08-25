import { describe, expect, it } from 'vitest';
import { canReadHealthProfile, requireFinancialAccess, requireOperationalAccess, requireRole, UnauthorizedError } from '../../lib/permissions';

describe('clinical-data permission', () => {
  it('allows only an administrator', () => {
    expect(canReadHealthProfile({ role: 'ADMIN' })).toBe(true);
    expect(canReadHealthProfile({ role: 'STUDENT' })).toBe(false);
  });
});

describe('employee role guards', () => {
  const employee = { id: 'employee-1', role: 'EMPLOYEE' as const };

  it('allows an employee to access operational resources', () => {
    expect(requireOperationalAccess(employee)).toEqual(employee);
  });

  it('blocks an employee from financial resources', () => {
    expect(() => requireFinancialAccess(employee)).toThrow(UnauthorizedError);
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
