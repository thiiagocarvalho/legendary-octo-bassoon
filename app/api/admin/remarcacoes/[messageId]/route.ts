import { NextResponse } from 'next/server';
import { requireOperationalAccess } from '../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../lib/permissions';
import { prisma } from '../../../../../lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    await requireOperationalAccess();
    const { messageId } = await params;
    const notification = await prisma.studentMessage.findUniqueOrThrow({ where: { id: messageId }, select: { content: true } });
    if (!notification.content.startsWith('Remarcação de aula')) return NextResponse.json({ error: 'Aviso de remarcação não encontrado.' }, { status: 404 });
    await prisma.studentMessage.delete({ where: { id: messageId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível apagar o aviso.' }, { status: 400 });
  }
}
