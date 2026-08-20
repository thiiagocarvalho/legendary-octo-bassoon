import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { BookingError, createBooking } from '../../../../server/services/bookings';

export async function GET() {
  const user = await requireStudent();
  if (!user.studentId) return NextResponse.json({ error: 'Perfil de aluno não vinculado.' }, { status: 403 });
  const occurrences = await prisma.classOccurrence.findMany({ where: { startsAt: { gte: new Date() } }, include: { classSlot: true, bookings: { where: { status: { not: 'CANCELED' } } } }, orderBy: { startsAt: 'asc' }, take: 60 });
  const mine = await prisma.booking.findMany({ where: { studentId: user.studentId, status: { not: 'CANCELED' }, occurrence: { startsAt: { gte: new Date() } } }, select: { id: true, occurrenceId: true } });
  const mineByOccurrence = new Map(mine.map((booking) => [booking.occurrenceId, booking.id]));
  return NextResponse.json(occurrences.map((item) => ({ id: item.id, startsAt: item.startsAt, endsAt: item.endsAt, capacity: item.classSlot.capacity, occupied: item.bookings.length, bookingId: mineByOccurrence.get(item.id) ?? null })));
}

export async function POST(request: Request) {
  const user = await requireStudent();
  if (!user.studentId) return NextResponse.json({ error: 'Perfil de aluno não vinculado.' }, { status: 403 });
  try { return NextResponse.json(await createBooking(user.studentId, (await request.json()).occurrenceId), { status: 201 }); }
  catch (error) { if (error instanceof BookingError) return NextResponse.json({ error: error.code }, { status: 409 }); throw error; }
}
