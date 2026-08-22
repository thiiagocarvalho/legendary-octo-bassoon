const formatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function bookingChangeNotification(previousStartsAt: Date, nextStartsAt: Date) {
  return `Remarcação de aula: ${formatter.format(previousStartsAt)} → ${formatter.format(nextStartsAt)}.`;
}
