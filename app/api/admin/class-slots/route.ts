import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { classSlotInput } from '../../../../lib/validation/schedule';
import { prisma } from '../../../../lib/db';

export async function POST(request: Request) {
  await requireAdmin();
  const data = classSlotInput.parse(await request.json());
  return NextResponse.json(await prisma.classSlot.create({ data }), { status: 201 });
}
