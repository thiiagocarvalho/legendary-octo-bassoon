const CHANGE_WINDOW_MS = 2 * 60 * 60 * 1000;

export function canReserveInWeek(currentReservations: number, weeklyLimit: number) {
  return currentReservations < weeklyLimit;
}

export function canChangeBooking(now: Date, startsAt: Date) {
  return startsAt.getTime() - now.getTime() > CHANGE_WINDOW_MS;
}

export function canSwapBooking(now: Date, currentStartsAt: Date, targetStartsAt: Date) {
  return canChangeBooking(now, currentStartsAt) && canChangeBooking(now, targetStartsAt);
}

export function canBookClass(occupiedSeats: number, capacity: number, weeklyReservations: number, weeklyLimit: number) {
  if (occupiedSeats >= capacity) return { allowed: false as const, code: 'CLASS_FULL' as const };
  if (!canReserveInWeek(weeklyReservations, weeklyLimit)) return { allowed: false as const, code: 'WEEKLY_LIMIT_REACHED' as const };
  return { allowed: true as const };
}
