import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import { requireRole, type SessionUser } from './permissions';

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
  return user?.id && user.role ? user : null;
}

export async function requireAdmin() {
  return requireRole(await getSessionUser(), 'ADMIN');
}

export async function requireStudent() {
  return requireRole(await getSessionUser(), 'STUDENT');
}
