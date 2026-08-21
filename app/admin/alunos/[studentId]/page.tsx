import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/db';
import { EditStudentForm } from '../../../../components/students/edit-student-form';
import { DeleteStudentButton } from '../../../../components/students/archive-student-button';
import { EnrollmentForm } from '../../../../components/students/enrollment-form';
import { HealthProfileForm } from '../../../../components/students/health-profile-form';
import { ProgressForm } from '../../../../components/students/progress-form';
import { attendanceSummary } from '../../../../lib/student-operation-summary';

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const [student, plans, history] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, include: { user: true, health: true, enrollments: { include: { plan: true }, orderBy: { startsAt: 'desc' } }, progress: { orderBy: { createdAt: 'desc' } }, bookings: { select: { status: true } }, makeupCredits: true } }),
    prisma.plan.findMany({ orderBy: { name: 'asc' } }),
    prisma.auditLog.findMany({ where: { entity: 'Student', entityId: studentId }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);
  if (!student) notFound();
  const attendance = attendanceSummary(student.bookings.map((item: { status: string }) => item.status));
  const available = student.makeupCredits.filter((item: { status: string }) => item.status === 'AVAILABLE').length;
  return <section className="grid gap-6"><div><p className="text-sm font-semibold text-emerald-700">Aluno</p><h1 className="text-3xl font-bold">{student.fullName}</h1><p className="text-sm text-slate-600">{student.user ? `E-mail de acesso: ${student.user.email}` : 'Sem acesso ao app cadastrado.'}</p></div><div className="grid gap-3 sm:grid-cols-3"><article className="rounded-xl border bg-white p-4"><strong>Presenças</strong><p className="text-2xl font-bold text-emerald-700">{attendance.present}</p></article><article className="rounded-xl border bg-white p-4"><strong>Faltas</strong><p className="text-2xl font-bold text-amber-700">{attendance.absent}</p></article><article className="rounded-xl border bg-white p-4"><strong>Frequência</strong><p className="text-2xl font-bold">{attendance.percentage}%</p><p className="text-sm">{available} reposição(ões) disponível(is)</p></article></div><section className="rounded-xl border bg-white p-4"><h2 className="font-bold">Histórico de ações</h2>{history.length ? history.map((item: { id: string; createdAt: Date; action: string; reason: string | null }) => <p className="mt-2 text-sm" key={item.id}>{item.createdAt.toLocaleString('pt-BR')} · {item.action}{item.reason ? ` · ${item.reason}` : ''}</p>) : <p className="mt-2 text-sm text-slate-600">Nenhuma ação registrada.</p>}</section><EditStudentForm student={student}/><DeleteStudentButton studentId={student.id}/><div className="grid gap-6 lg:grid-cols-2"><div><EnrollmentForm studentId={student.id} plans={plans}/><h2 className="mb-3 mt-6 text-xl font-bold">Restrições e objetivos</h2><HealthProfileForm initial={student.health ?? undefined} studentId={student.id}/></div><div><h2 className="mb-3 text-xl font-bold">Evolução funcional</h2><ProgressForm studentId={student.id}/><div className="mt-4 grid gap-3">{student.progress.map((item: { id: string; createdAt: Date; note: string }) => <article className="rounded-lg border bg-white p-4" key={item.id}><time className="text-xs text-slate-500">{item.createdAt.toLocaleDateString('pt-BR')}</time><p>{item.note}</p></article>)}</div></div></div></section>;
}
