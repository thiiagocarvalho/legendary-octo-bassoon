export function expectedManualPaymentCents(monthlyPriceCents: number, monthsCovered: number) {
  return monthlyPriceCents * monthsCovered;
}
