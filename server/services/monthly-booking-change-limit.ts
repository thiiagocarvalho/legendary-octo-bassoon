export function monthlyBookingChangeDecision(changesThisMonth: number) {
  return changesThisMonth >= 2
    ? { allowed: false as const, code: 'MONTHLY_CHANGE_LIMIT_REACHED' as const }
    : { allowed: true as const };
}
