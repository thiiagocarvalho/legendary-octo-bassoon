export function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}
