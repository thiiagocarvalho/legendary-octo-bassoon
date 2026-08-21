import { BookingStatus, MakeupCreditStatus, Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { writeAuditLog } from './audit';

export class MakeupCreditError extends Error {
  constructor(public code: 'BOOKING_NOT_ABSENT' | 'CREDIT_ALREADY_EXISTS' | 'NO_MAKEUP_CREDIT') { super(code); }
}

export async function createMakeupCredit(bookingId: string, actorId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== BookingStatus.ABSENT) throw new MakeupCreditError('BOOKING_NOT_ABSENT');

  const existing = await prisma.makeupCredit.findUnique({ where: { sourceBookingId: booking.id } });
  if (existing) throw new MakeupCreditError('CREDIT_ALREADY_EXISTS');

  const credit = await prisma.makeupCredit.create({ data: { studentId: booking.studentId, sourceBookingId: booking.id } });
  await writeAuditLog({ actorId, action: 'MAKEUP_CREDIT_CREATED', entity: 'Student', entityId: booking.studentId, reason: `Reposição liberada pela falta ${booking.id}` });
  return credit;
}

export async function availableMakeupCredits(studentId: string) {
  return prisma.makeupCredit.findMany({ where: { studentId, status: MakeupCreditStatus.AVAILABLE }, orderBy: { createdAt: 'asc' } });
}

export async function consumeMakeupCredit(studentId: string, bookingId: string, tx: Prisma.TransactionClient) {
  const credit = await tx.makeupCredit.findFirst({ where: { studentId, status: MakeupCreditStatus.AVAILABLE }, orderBy: { createdAt: 'asc' } });
  if (!credit) throw new MakeupCreditError('NO_MAKEUP_CREDIT');
  return tx.makeupCredit.update({ where: { id: credit.id }, data: { status: MakeupCreditStatus.USED, usedBookingId: bookingId, usedAt: new Date() } });
}
