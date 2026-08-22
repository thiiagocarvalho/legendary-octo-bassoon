import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { buildAttendanceRoster } from '../../../../server/services/attendance-roster';

export async function GET() {
  await requireAdmin();
  const occurrences = await prisma.classOccurrence.findMany({
    where: { startsAt: { gte: new Date() } },
    include: {
      classSlot: {
        include: {
          enrollments: {
            where: { status: { in: ['ACTIVE', 'PENDING'] }, student: { archivedAt: null } },
            include: { student: { select: { id: true, fullName: true } } },
            orderBy: { student: { fullName: 'asc' } },
          },
        },
      },
      bookings: { include: { student: true }, orderBy: { createdAt: 'asc' } },
    },
    orderBy: { startsAt: 'asc' },
    take: 30,
  });

  return NextResponse.json(occurrences.map((occurrence) => ({
    ...occurrence,
    roster: buildAttendanceRoster(occurrence.classSlot.enrollments, occurrence.bookings),
  })));
}
