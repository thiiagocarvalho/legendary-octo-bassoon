export function enrollmentStatusAfterApprovedPayment(currentStatus: string) {
  return currentStatus === 'PENDING' ? 'ACTIVE' : currentStatus;
}
