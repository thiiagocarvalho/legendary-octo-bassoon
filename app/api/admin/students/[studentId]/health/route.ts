import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { UnauthorizedError } from '../../../../../../lib/permissions';
import { upsertHealthProfile } from '../../../../../../server/services/students';

export async function PUT(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const admin = await requireAdmin();
    const { studentId } = await params;
    const health = await upsertHealthProfile(studentId, await request.json(), admin.id);
    return NextResponse.json(health);
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível salvar a ficha.' }, { status: 400 });
  }
}
