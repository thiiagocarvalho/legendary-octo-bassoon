import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../../lib/permissions';
import { createFunctionalProgress } from '../../../../../../server/services/students';

export async function POST(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { studentId } = await params;
    const progress = await createFunctionalProgress(studentId, await request.json(), admin.id);
    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível registrar a evolução.' }, { status: 400 });
  }
}
