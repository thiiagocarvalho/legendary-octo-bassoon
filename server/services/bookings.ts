import { BookingStatus } from '@prisma/client';
import { prisma, type TransactionClient } from '../../lib/db';
import { canBookClass, canChangeBooking, canSwapBooking } from './booking-rules';
import { consumeMakeupCredit } from './makeup-credits';
import { makeupBookingDecision } from './makeup-credit-rules';
import { bookingChangeNotification } from './booking-change-notification';
import { monthlyBookingChangeDecision } from './monthly-booking-change-limit';

export class BookingError extends Error {
  constructor(public code: 'ENROLLMENT_INACTIVE' | 'CLASS_FULL' | 'WEEKLY_LIMIT_REACHED' | 'CHANGE_WINDOW_CLOSED' | 'ALREADY_BOOKED' | 'NO_MAKEUP_CREDIT' | 'MONTHLY_CHANGE_LIMIT_REACHED') { super(code); }
}

function weekRange(date: Date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export async function createBooking(studentId: string, occurrenceId: string) {
  return prisma.$transaction(async (tx: TransactionClient) => {
    const occurrence = await tx.classOccurrence.findUnique({ where: { id: occurrenceId }, include: { classSlot: true } });
    if (!occurrence) throw new BookingError('CLASS_FULL');
    const enrollment = await tx.enrollment.findFirst({ where: { studentId, status: 'ACTIVE' }, include: { plan: true }, orderBy: { startsAt: 'desc' } });
    if (!enrollment) throw new BookingError('ENROLLMENT_INACTIVE');
    const { start, end } = weekRange(occurrence.startsAt);
    const [occupied, weeklyReservations, existing] = await Promise.all([
      tx.booking.count({ where: { occurrenceId, status: { not: 'CANCELED' } } }),
      tx.booking.count({ where: { studentId, status: { in: ['RESERVED', 'PRESENT'] }, occurrence: { startsAt: { gte: start, lt: end } } } }),
      tx.booking.findUnique({ where: { studentId_occurrenceId: { studentId, occurrenceId } } }),
    ]);
    if (existing && existing.status !== BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
    const decision = canBookClass(occupied, occurrence.classSlot.capacity, weeklyReservations, enrollment.plan.weeklyBookingLimit);
    if (!decision.allowed) throw new BookingError(decision.code);
    if (existing) return tx.booking.update({ where: { id: existing.id }, data: { status: BookingStatus.RESERVED } });
    return tx.booking.create({ data: { studentId, occurrenceId } });
  });
}

export async function changeBooking(studentId: string, bookingId: string, targetOccurrenceId: string, now = new Date()) {
  return prisma.$transaction(async (tx: TransactionClient) => {
    const [current, target, enrollment] = await Promise.all([
      tx.booking.findFirst({ where: { id: bookingId, studentId }, include: { occurrence: true } }),
      tx.classOccurrence.findUnique({ where: { id: targetOccurrenceId }, include: { classSlot: true } }),
      tx.enrollment.findFirst({ where: { studentId, status: 'ACTIVE' }, include: { plan: true }, orderBy: { startsAt: 'desc' } }),
    ]);
    if (!current || current.status === BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
    if (!target) throw new BookingError('CLASS_FULL');
    if (!enrollment) throw new BookingError('ENROLLMENT_INACTIVE');
    if (!canSwapBooking(now, current.occurrence.startsAt, target.startsAt)) throw new BookingError('CHANGE_WINDOW_CLOSED');
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const changesThisMonth = await tx.auditLog.count({ where: { actorId: studentId, action: 'BOOKING_CHANGED', createdAt: { gte: monthStart, lt: nextMonthStart } } });
    const monthlyChangeDecision = monthlyBookingChangeDecision(changesThisMonth);
    if (!monthlyChangeDecision.allowed) throw new BookingError(monthlyChangeDecision.code);

    const { start, end } = weekRange(target.startsAt);
    const [occupied, weeklyReservations, targetBooking] = await Promise.all([
      tx.booking.count({ where: { occurrenceId: target.id, status: { not: BookingStatus.CANCELED } } }),
      tx.booking.count({ where: { studentId, status: { in: [BookingStatus.RESERVED, BookingStatus.PRESENT] }, occurrence: { startsAt: { gte: start, lt: end } } } }),
      tx.booking.findUnique({ where: { studentId_occurrenceId: { studentId, occurrenceId: target.id } } }),
    ]);
    if (targetBooking && targetBooking.status !== BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
    const currentInTargetWeek = current.occurrence.startsAt >= start && current.occurrence.startsAt < end ? 1 : 0;
    const targetOccupied = occupied + (targetBooking?.status === BookingStatus.CANCELED ? 0 : 0);
    const decision = canBookClass(targetOccupied, target.classSlot.capacity, weeklyReservations - currentInTargetWeek, enrollment.plan.weeklyBookingLimit);
    if (!decision.allowed) throw new BookingError(decision.code);

    const replacement = targetBooking
      ? await tx.booking.update({ where: { id: targetBooking.id }, data: { status: BookingStatus.RESERVED } })
      : await tx.booking.create({ data: { studentId, occurrenceId: target.id } });
    await tx.booking.update({ where: { id: current.id }, data: { status: BookingStatus.CANCELED } });
    await tx.auditLog.create({ data: { actorId: studentId, action: 'BOOKING_CHANGED', entity: 'Booking', entityId: replacement.id, reason: `Troca de ${current.occurrence.startsAt.toISOString()} para ${target.startsAt.toISOString()}` } });
    await tx.studentMessage.create({ data: { studentId, content: bookingChangeNotification(current.occurrence.startsAt, target.startsAt) } });
    return replacement;
  }, { isolationLevel: 'Serializable' });
}

export async function reportAbsenceAndCreateMakeup(studentId: string, bookingId: string, now = new Date()) {
  return prisma.$transaction(async (tx: TransactionClient) => {
    const current = await tx.booking.findFirst({ where: { id: bookingId, studentId }, include: { occurrence: true } });
    if (!current || current.status === BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
    if (!canChangeBooking(now, current.occurrence.startsAt)) throw new BookingError('CHANGE_WINDOW_CLOSED');

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const changesThisMonth = await tx.auditLog.count({ where: { actorId: studentId, action: 'BOOKING_CHANGED', createdAt: { gte: monthStart, lt: nextMonthStart } } });
    const monthlyChangeDecision = monthlyBookingChangeDecision(changesThisMonth);
    if (!monthlyChangeDecision.allowed) throw new BookingError(monthlyChangeDecision.code);

    await tx.booking.update({ where: { id: current.id }, data: { status: BookingStatus.CANCELED } });
    const credit = await tx.makeupCredit.create({ data: { studentId, sourceBookingId: current.id } });
    await tx.auditLog.create({ data: { actorId: studentId, action: 'BOOKING_CHANGED', entity: 'Booking', entityId: current.id, reason: `Falta avisada para ${current.occurrence.startsAt.toISOString()}` } });
    await tx.studentMessage.create({ data: { studentId, content: `Remarcação de aula: falta avisada para ${current.occurrence.startsAt.toLocaleString('pt-BR')}. Vaga liberada e reposição disponível.` } });
    return credit;
  }, { isolationLevel: 'Serializable' });
}

export async function cancelBooking(studentId: string, bookingId: string, now = new Date()) {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, studentId }, include: { occurrence: true } });
  if (!booking || booking.status === BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
  if (!canChangeBooking(now, booking.occurrence.startsAt)) throw new BookingError('CHANGE_WINDOW_CLOSED');
  return prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELED' } });
}

export async function createMakeupBooking(studentId: string, occurrenceId: string) {
  return prisma.$transaction(async (tx: TransactionClient) => {
    const occurrence = await tx.classOccurrence.findUnique({ where: { id: occurrenceId }, include: { classSlot: true } });
    if (!occurrence) throw new BookingError('CLASS_FULL');
    const [availableCredits, occupied, existing] = await Promise.all([
      tx.makeupCredit.count({ where: { studentId, status: 'AVAILABLE' } }),
      tx.booking.count({ where: { occurrenceId, status: { not: BookingStatus.CANCELED } } }),
      tx.booking.findUnique({ where: { studentId_occurrenceId: { studentId, occurrenceId } } }),
    ]);
    if (existing && existing.status !== BookingStatus.CANCELED) throw new BookingError('ALREADY_BOOKED');
    const decision = makeupBookingDecision(availableCredits, occupied, occurrence.classSlot.capacity);
    if (!decision.allowed) throw new BookingError(decision.code);
    const booking = existing
      ? await tx.booking.update({ where: { id: existing.id }, data: { status: BookingStatus.RESERVED } })
      : await tx.booking.create({ data: { studentId, occurrenceId } });
    await consumeMakeupCredit(studentId, booking.id, tx);
    await tx.auditLog.create({ data: { actorId: studentId, action: 'MAKEUP_CREDIT_USED', entity: 'Student', entityId: studentId, reason: `Reposição usada na aula ${occurrenceId}` } });
    return booking;
  }, { isolationLevel: 'Serializable' });
}
