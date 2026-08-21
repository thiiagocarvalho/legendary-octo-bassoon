export function attendanceSummary(statuses: string[]) {
  const present = statuses.filter((status: string) => status === 'PRESENT').length;
  const absent = statuses.filter((status: string) => status === 'ABSENT').length;
  return { present, absent, percentage: present + absent ? Math.round((present / (present + absent)) * 100) : 0 };
}
