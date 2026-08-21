type Student = { fullName: string; phone: string };
const day = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
export function paymentReminder(student: Student, dueDate: Date, now = new Date()) {
  const difference = Math.round((day(dueDate) - day(now)) / 86_400_000);
  if (difference > 1) return null;
  const date = dueDate.toLocaleDateString('pt-BR');
  const label = difference === 1 ? 'Vence amanhã' : difference === 0 ? 'Vence hoje' : 'Em atraso';
  const text = difference === 1 ? `Olá, ${student.fullName}! Sua mensalidade vence amanhã (${date}).` : difference === 0 ? `Olá, ${student.fullName}! Sua mensalidade vence hoje (${date}).` : `Olá, ${student.fullName}! Sua mensalidade com vencimento em ${date} está em atraso.`;
  const number = student.phone.replace(/\D/g, '').replace(/^55/, '');
  return { label, href: `https://wa.me/55${number}?text=${encodeURIComponent(text)}` };
}
