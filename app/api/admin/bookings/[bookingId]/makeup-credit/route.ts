import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { MakeupCreditError, createMakeupCredit } from '../../../../../../server/services/makeup-credits';

export async function POST(_: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const admin = await requireAdmin();
  try { return NextResponse.json(await createMakeupCredit((await params).bookingId, admin.id), { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof MakeupCreditError ? error.code : 'Não foi possível liberar a reposição.' }, { status: 400 }); }
}
