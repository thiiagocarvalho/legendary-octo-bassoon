const labels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function weekdayLabel(weekday: number) {
  return labels[weekday] ?? 'Dia não informado';
}

export function weekdayPairLabel(weekday: number, secondWeekday: number | null) {
  if (secondWeekday === null) return weekdayLabel(weekday);
  const pair = [weekday, secondWeekday].sort((a, b) => a - b).join('-');
  if (pair === '1-3') return 'Segunda e Quarta';
  if (pair === '2-4') return 'Terça e Quinta';
  return `${weekdayLabel(weekday)} e ${weekdayLabel(secondWeekday)}`;
}
