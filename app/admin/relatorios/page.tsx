import { redirect } from 'next/navigation';
import { getSessionUser } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { buildMonthlyReport } from '../../../server/services/monthly-report';

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  if ((await getSessionUser())?.role !== 'ADMIN') redirect('/admin');
  const { mes } = await searchParams;
  const selected = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : new Date().toISOString().slice(0, 7);
  const [year, month] = selected.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [payments, invoices, bookings, credits, activeStudents] = await Promise.all([
    prisma.manualPayment.aggregate({ where: { receivedAt: { gte: start, lt: end } }, _sum: { amountCents: true } }),
    prisma.invoice.findMany({ where: { dueDate: { gte: start, lt: end }, status: { in: ['PENDING', 'OVERDUE'] } }, include: { enrollment: { include: { student: true } } }, orderBy: { dueDate: 'asc' } }),
    prisma.booking.findMany({ where: { occurrence: { startsAt: { gte: start, lt: end } }, status: { in: ['PRESENT', 'ABSENT'] } }, include: { student: true } }),
    prisma.makeupCredit.findMany({ where: { createdAt: { gte: start, lt: end } }, select: { status: true } }),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
  ]);

  const report = buildMonthlyReport({
    activeStudents,
    receivedCents: payments._sum.amountCents ?? 0,
    pendingInvoices: invoices.length,
    credits,
    bookings: bookings.map((booking) => ({ studentId: booking.studentId, fullName: booking.student.fullName, status: booking.status })),
  });
  const monthLabel = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <section>
      <p className="text-sm font-semibold text-amber-700">Relatórios</p>
      <h1 className="text-3xl font-bold text-slate-950">Resumo mensal</h1>
      <p className="mt-1 text-slate-600">Fechamento do estúdio em {monthLabel}.</p>
      <form className="mt-5 flex flex-wrap items-end gap-3" action="/admin/relatorios">
        <label className="font-semibold text-slate-800">Mês <input className="ml-2 rounded-lg border border-slate-300 bg-white p-2" name="mes" type="month" defaultValue={selected} /></label>
        <button className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white hover:bg-slate-800">Ver resumo</button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Recebido no mês" value={formatCurrency(report.receivedCents)} />
        <Metric label="Alunos ativos" value={String(report.activeStudents)} />
        <Metric label="Mensalidades pendentes" value={String(report.pendingInvoices)} tone="alert" />
        <Metric label="Aulas registradas" value={`${report.present} presentes · ${report.absent} faltas`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Pendências do mês</h2>
          {invoices.length ? invoices.map((invoice) => <p className="mt-3 text-slate-700" key={invoice.id}><strong>{invoice.enrollment.student.fullName}</strong> · vence em {invoice.dueDate.toLocaleDateString('pt-BR')}</p>) : <p className="mt-3 text-slate-600">Nenhuma pendência neste mês.</p>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Reposições</h2>
          <p className="mt-3 text-slate-700"><strong>{report.availableCredits}</strong> disponíveis · <strong>{report.usedCredits}</strong> utilizadas no mês.</p>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-950">Frequência por aluno</h2>
        {report.attendance.length ? <div className="mt-3 divide-y divide-slate-100">{report.attendance.map((row) => <p className="py-3 text-slate-700" key={row.studentId}><strong>{row.fullName}</strong> · {row.present} presença(s), {row.absent} falta(s)</p>)}</div> : <p className="mt-3 text-slate-600">Sem presença ou falta registrada neste mês.</p>}
      </section>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'alert' }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-slate-600">{label}</p><p className={`mt-2 text-2xl font-bold ${tone === 'alert' ? 'text-amber-700' : 'text-slate-950'}`}>{value}</p></article>;
}
