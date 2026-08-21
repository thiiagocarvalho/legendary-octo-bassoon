export function canUseMakeupCredit(credit: { status: 'AVAILABLE' | 'USED' | 'CANCELED' }) {
  return credit.status === 'AVAILABLE';
}

export function makeupBookingDecision(availableCredits: number, occupied: number, capacity: number) {
  if (!availableCredits) return { allowed: false as const, code: 'NO_MAKEUP_CREDIT' as const };
  if (occupied >= capacity) return { allowed: false as const, code: 'CLASS_FULL' as const };
  return { allowed: true as const };
}
