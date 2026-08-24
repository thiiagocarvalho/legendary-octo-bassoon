import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../lib/permissions';
import { ClassSlotDeletionError, deleteClassSlot } from '../../../../../server/services/class-slots';

export async function DELETE(_: Request, { params }: { params: Promise<{ classSlotId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { classSlotId } = await params;
    return NextResponse.json(await deleteClassSlot(classSlotId, admin.id));
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof ClassSlotDeletionError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: 'Não foi possível excluir a turma.' }, { status: 400 });
  }
}
