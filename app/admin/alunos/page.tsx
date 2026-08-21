import Link from 'next/link';
import { prisma } from '../../../lib/db';
import { StudentForm } from '../../../components/students/student-form';

export default async function StudentsPage() {
  const [students, plans, classSlots] = await Promise.all([prisma.student.findMany({ where: { archivedAt: null }, orderBy: { fullName: 'asc' }, include: { enrollments: { where: { status: { not: 'CANCELED' } }, include: { plan: true, invoices: { where: { status: { in: ['PENDING', 'OVERDUE'] } }, orderBy: { dueDate: 'asc' }, take: 1 } }, orderBy: { startsAt: 'desc' }, take: 1 } } }), prisma.plan.findMany({ orderBy: { name: 'asc' } }), prisma.classSlot.findMany({ orderBy: [{ weekday: 'asc' }, { startsTime: 'asc' }] })]);

  return <section className="grid gap-6">
    <div><p className="text-sm font-semibold text-emerald-700">Cadastro</p><h1 className="text-3xl font-bold">Alunos</h1></div>
    <StudentForm plans={plans} classSlots={classSlots} />
    <div className="overflow-hidden rounded-xl border bg-white">
      {students.length === 0 ? <p className="p-5 text-slate-600">Nenhum aluno cadastrado ainda.</p> : students.map((student) => { const invoice=student.enrollments[0]?.invoices[0]; const today=new Date(); today.setHours(0,0,0,0); const due=invoice?.dueDate ? new Date(invoice.dueDate) : null; due?.setHours(0,0,0,0); const days=due ? Math.round((due.getTime()-today.getTime())/86400000) : null; const badge=days===0?'Vence hoje':days===1?'Vence amanhã':'Em dia'; const badgeClass=days===0?'bg-red-100 text-red-700':days===1?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-700'; const message=days===0?`Olá, ${student.fullName}! Sua mensalidade vence hoje, ${due?.toLocaleDateString('pt-BR')}.`:days===1?`Olá, ${student.fullName}! Sua mensalidade vence amanhã, ${due?.toLocaleDateString('pt-BR')}.`:`Olá, ${student.fullName}! Tudo bem? Estamos à disposição.`; const phone=student.phone.replace(/\D/g,'').replace(/^55/,''); const whats=`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`; return <article className="flex items-center justify-between gap-3 border-b p-4 last:border-0" key={student.id}><Link className="min-w-0 hover:bg-slate-50" href={`/admin/alunos/${student.id}`}><strong>{student.fullName}</strong><span className="ml-3 text-sm text-slate-600">{student.phone} · {student.enrollments[0]?.plan.name ?? 'Sem matrícula'}</span></Link><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>{badge}</span><a className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" href={whats} rel="noopener noreferrer" target="_blank">Enviar mensagem</a></article>})}
    </div>
  </section>;
}
