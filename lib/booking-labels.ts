export function bookingStatusLabel(status: string) {
  return ({ RESERVED: 'Reservada', PRESENT: 'Presente', ABSENT: 'Falta', CANCELED: 'Cancelada' } as Record<string, string>)[status] ?? status;
}
