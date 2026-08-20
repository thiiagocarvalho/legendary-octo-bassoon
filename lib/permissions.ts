export type SessionUser = {
  id: string;
  role: 'ADMIN' | 'STUDENT';
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
