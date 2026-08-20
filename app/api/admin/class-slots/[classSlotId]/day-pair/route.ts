import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { UnauthorizedError } from '../../../../../../lib/permissions';
import { dayPairInput } from '../../../../../../lib/validation/schedule';
import { materializeOccurrences } from '../../../../../../server/services/occurrences';

export async function PATCH(request: Request, { params }: { params: Promise<{ classSlotId: string }> }) {
  try {
    await requireAdmin();
    const { classSlotId } = await params;
    const pair = dayPairInput.parse(await request.json());
    const slot = await prisma.classSlot.findUniqueOrThrow({ where: { id: classSlotId } });
    if (![pair.weekday, pair.secondWeekday].includes(slot.weekday)) return NextResponse.json({ error: 'Escolha a combinação compatível com o primeiro dia da turma.' }, { status: 400 });
    const secondWeekday = slot.weekday === pair.weekday ? pair.secondWeekday : pair.weekday;
    await prisma.classSlot.update({ where: { id: classSlotId }, data: { secondWeekday } });
    return NextResponse.json(await materializeOccurrences(classSlotId));
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível completar os dias da turma.' }, { status: 400 });
  }
}
