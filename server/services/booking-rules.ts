const CHANGE_WINDOW_MS = 2 * 60 * 60 * 1000;

export function canReserveInWeek(currentReservations: number, weeklyLimit: number) {
  return currentReservations < weeklyLimit;
}

export function canChangeBooking(now: Date, startsAt: Date) {
  return startsAt.getTime() - now.getTime() > CHANGE_WINDOW_MS;
}
