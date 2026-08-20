const labels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function weekdayLabel(weekday: number) {
  return labels[weekday] ?? 'Dia não informado';
}
