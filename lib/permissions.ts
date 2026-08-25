export type SessionUser = {
  id: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'STUDENT';
  studentId?: string;
};

export class UnauthorizedError extends Error {
  constructor(message = 'Acesso não autorizado.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function canReadHealthProfile(user: Pick<SessionUser, 'role'>) {
  return user.role === 'ADMIN';
}

export function requireRole(user: SessionUser | null, role: SessionUser['role']) {
  if (!user || user.role !== role) {
    throw new UnauthorizedError();
  }

  return user;
}

export function requireOperationalAccess(user: SessionUser | null) {
  if (!user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) throw new UnauthorizedError();
  return user;
}

export function requireFinancialAccess(user: SessionUser | null) {
  return requireRole(user, 'ADMIN');
}
