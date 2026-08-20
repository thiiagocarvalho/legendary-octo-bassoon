import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { classSlotInput } from '../../../../lib/validation/schedule';
import { prisma } from '../../../../lib/db';
import { materializeOccurrences } from '../../../../server/services/occurrences';

export async function POST(request: Request) {
  await requireAdmin();
  const data = classSlotInput.parse(await request.json());
  const classSlot = await prisma.classSlot.create({ data });
  const occurrences = await materializeOccurrences(classSlot.id);
  return NextResponse.json({ classSlot, occurrencesCreated: occurrences.length }, { status: 201 });
}
