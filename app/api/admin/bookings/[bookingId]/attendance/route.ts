import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  await requireAdmin();
  const { bookingId } = await params;
  const { status } = await request.json();
  if (!['PRESENT', 'ABSENT', 'CANCELED'].includes(status)) return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  const { prisma } = await import('../../../../../../lib/db');
  return NextResponse.json(await prisma.booking.update({ where: { id: bookingId }, data: { status } }));
}
