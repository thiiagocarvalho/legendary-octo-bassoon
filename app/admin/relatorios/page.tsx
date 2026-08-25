import { prisma } from '../../../lib/db';
import { getSessionUser } from '../../../lib/auth';
import { redirect } from 'next/navigation';

type AttendanceRow = { name: string; present: number; absent: number };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  if ((await getSessionUser())?.role !== 'ADMIN') redirect('/admin');
  const { mes } = await searchParams;
  const selected = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : new Date().toISOString().slice(0, 7);
  const [year, month] = selected.split('-').map(Number);
  const start = new Date(year, month - 1, 1); const end = new Date(year, month, 1);
  const [payments, invoices, bookings, credits] = await Promise.all([
    prisma.manualPayment.aggregate({ where: { receivedAt: { gte: start, lt: end } }, _sum: { amountCents: true } }),
    prisma.invoice.findMany({ where: { dueDate: { gte: start, lt: end }, status: { in: ['PENDING', 'OVERDUE'] } }, include: { enrollment: { include: { student: true } } } }),
    prisma.booking.findMany({ where: { occurrence: { startsAt: { gte: start, lt: end } }, status: { in: ['PRESENT', 'ABSENT'] } }, include: { student: true } }),
    prisma.makeupCredit.findMany({ where: { createdAt: { gte: start, lt: end } } }),
  ]);
  const attendance: AttendanceRow[] = Object.values(bookings.reduce<Record<string, AttendanceRow>>((all: Record<string, AttendanceRow>, booking: (typeof bookings)[number]) => { const row = all[booking.studentId] ?? { name: booking.student.fullName, present: 0, absent: 0 }; row[booking.status === 'PRESENT' ? 'present' : 'absent']++; all[booking.studentId] = row; return all; }, {})) as AttendanceRow[];
  return <section><p className="text-sm font-semibold text-emerald-700">Relatórios</p><h1 className="text-3xl font-bold">Resumo operacional</h1><form className="mt-4" action="/admin/relatorios"><label className="font-semibold">Mês <input className="ml-2 rounded border p-2" name="mes" type="month" defaultValue={selected}/></label><button className="ml-2 rounded bg-emerald-700 px-4 py-2 font-bold text-white">Filtrar</button></form><div className="mt-5 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border bg-white p-4"><strong>Recebido</strong><p className="text-2xl font-bold">R$ {((payments._sum.amountCents ?? 0) / 100).toFixed(2).replace('.', ',')}</p></article><article className="rounded-xl border bg-white p-4"><strong>Mensalidades pendentes</strong><p className="text-2xl font-bold">{invoices.length}</p></article><article className="rounded-xl border bg-white p-4"><strong>Reposições</strong><p className="text-2xl font-bold">{credits.filter((item: (typeof credits)[number]) => item.status === 'AVAILABLE').length} disponíveis · {credits.filter((item: (typeof credits)[number]) => item.status === 'USED').length} usadas</p></article></div><section className="mt-6 rounded-xl border bg-white p-4"><h2 className="font-bold">Inadimplentes</h2>{invoices.length ? invoices.map((item: (typeof invoices)[number]) => <p className="mt-2" key={item.id}>{item.enrollment.student.fullName} · vencimento {item.dueDate.toLocaleDateString('pt-BR')}</p>) : <p className="mt-2 text-slate-600">Nenhuma pendência neste mês.</p>}</section><section className="mt-6 rounded-xl border bg-white p-4"><h2 className="font-bold">Frequência por aluno</h2>{attendance.length ? attendance.map((row: AttendanceRow) => <p className="mt-2" key={row.name}>{row.name} · {row.present} presença(s), {row.absent} falta(s)</p>) : <p className="mt-2 text-slate-600">Sem presença ou falta registrada neste mês.</p>}</section></section>;
}
