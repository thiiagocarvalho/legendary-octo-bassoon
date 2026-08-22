import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@pilates.local' },
    select: { passwordHash: true },
  });
  const password = process.env.SEED_ADMIN_PASSWORD;

  return NextResponse.json({
    adminFound: Boolean(user),
    configuredPasswordMatches: Boolean(user && password && await bcrypt.compare(password, user.passwordHash)),
  });
}
