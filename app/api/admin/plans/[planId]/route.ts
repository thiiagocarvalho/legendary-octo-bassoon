import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../lib/permissions';
import { deletePlan, PlanDeletionError } from '../../../../../server/services/plans';

export async function DELETE(_: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { planId } = await params;
    return NextResponse.json(await deletePlan(planId, admin.id));
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof PlanDeletionError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: 'Não foi possível excluir o plano.' }, { status: 400 });
  }
}
