import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { isAttendanceStatus, recordAttendance } from '../../../../../../server/services/attendance';

export async function PATCH(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const admin = await requireAdmin();
  const { bookingId } = await params;
  const { status, reason } = await request.json();
  if (!isAttendanceStatus(status)) return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  if (status === 'CANCELED' && !reason?.trim()) return NextResponse.json({ error: 'Informe o motivo do cancelamento manual.' }, { status: 400 });
  return NextResponse.json(await recordAttendance(bookingId, status, admin.id, reason?.trim()));
}
