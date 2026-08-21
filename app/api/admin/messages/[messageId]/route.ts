import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../lib/permissions';
import { prisma } from '../../../../../lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    await requireAdmin();
    const { messageId } = await params;
    await prisma.studentMessage.delete({ where: { id: messageId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível apagar a mensagem.' }, { status: 400 });
  }
}
