const labels: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  OVERDUE: 'Em atraso',
  VOID: 'Cancelado',
};

export function invoiceStatusLabel(status: string) {
  return labels[status] ?? status;
}
