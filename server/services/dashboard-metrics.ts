export function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export function monthlyForecastCents(enrollments: Array<{ plan: { monthlyPriceCents: number } }>) {
  return enrollments.reduce((sum: number, enrollment: { plan: { monthlyPriceCents: number } }) => sum + enrollment.plan.monthlyPriceCents, 0);
}
