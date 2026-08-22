import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'crypto';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

function tokensMatch(received: string | null, expected: string | undefined) {
  if (!received || !expected || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!tokensMatch(request.headers.get('x-admin-reset-token'), process.env.ADMIN_RESET_TOKEN)) {
    return new NextResponse(null, { status: 404 });
  }

  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) return NextResponse.json({ error: 'Senha inicial não configurada.' }, { status: 500 });

  await prisma.user.upsert({
    where: { email: 'admin@pilates.local' },
    update: { passwordHash: await bcrypt.hash(password, 12), role: Role.ADMIN },
    create: { email: 'admin@pilates.local', passwordHash: await bcrypt.hash(password, 12), role: Role.ADMIN },
  });

  return new NextResponse(null, { status: 204 });
}
