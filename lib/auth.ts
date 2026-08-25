import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import { requireFinancialAccess as requireFinancialRole, requireOperationalAccess as requireOperationalRole, requireRole, type SessionUser } from './permissions';

type TokenWithRole = {
  sub?: string;
  role?: SessionUser['role'];
  studentId?: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { student: { select: { id: true } } },
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          studentId: user.student?.id,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const signedInUser = user as unknown as SessionUser;
        const sessionToken = token as TokenWithRole;
        sessionToken.role = signedInUser.role;
        sessionToken.studentId = signedInUser.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      const sessionToken = token as TokenWithRole;
      if (session.user && sessionToken.sub && sessionToken.role) {
        Object.assign(session.user, {
          id: sessionToken.sub,
          role: sessionToken.role,
          studentId: sessionToken.studentId,
        });
      }
      return session;
    },
  },
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as (SessionUser | undefined);
  if (!user?.id || !user.role) return null;
  if (user.role === 'STUDENT' && (!user.studentId || !(await prisma.student.findFirst({ where: { id: user.studentId, archivedAt: null }, select: { id: true } })))) return null;
  return user;
}

export async function requireAdmin() {
  return requireFinancialRole(await getSessionUser());
}

export async function requireOperationalAccess() {
  return requireOperationalRole(await getSessionUser());
}

export async function requireFinancialAccess() {
  return requireFinancialRole(await getSessionUser());
}

export async function requireStudent() {
  return requireRole(await getSessionUser(), 'STUDENT');
}
