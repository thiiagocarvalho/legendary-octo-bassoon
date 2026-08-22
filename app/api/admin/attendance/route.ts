import { NextResponse } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { isAttendanceStatus } from '../../../../server/services/attendance';
import { writeAuditLog } from '../../../../server/services/audit';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const { occurrenceId, studentId, status } = await request.json();

  if (!occurrenceId || !studentId || !isAttendanceStatus(status) || status === BookingStatus.CANCELED) {
    return NextResponse.json({ error: 'Dados de presença inválidos.' }, { status: 400 });
  }

  const occurrence = await prisma.classOccurrence.findUnique({ where: { id: occurrenceId }, select: { classSlotId: true } });
  const enrollment = occurrence ? await prisma.enrollment.findFirst({
    where: { studentId, classSlotId: occurrence.classSlotId, status: { in: ['ACTIVE', 'PENDING'] } },
    select: { id: true },
  }) : null;
  if (!enrollment) return NextResponse.json({ error: 'Aluno não pertence a esta turma.' }, { status: 400 });

  const booking = await prisma.booking.upsert({
    where: { studentId_occurrenceId: { studentId, occurrenceId } },
    create: { studentId, occurrenceId, status },
    update: { status },
  });
  await writeAuditLog({ actorId: admin.id, action: `BOOKING_${status}`, entity: 'Student', entityId: studentId });

  return NextResponse.json(booking);
}
