export function studentUpcomingClasses<T extends { bookingId: string | null; startsAt: string }>(occurrences: T[]) {
  return occurrences.filter((occurrence) => occurrence.bookingId !== null).sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}
