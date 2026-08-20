import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/db';
import { HealthProfileForm } from '../../../../components/students/health-profile-form';
import { ProgressForm } from '../../../../components/students/progress-form';
import { EnrollmentForm } from '../../../../components/students/enrollment-form';
import { EditStudentForm } from '../../../../components/students/edit-student-form';
import { ArchiveStudentButton } from '../../../../components/students/archive-student-button';

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const [student, plans] = await Promise.all([prisma.student.findUnique({ where: { id: studentId }, include: { health: true, healthHistory: { orderBy: { createdAt: 'desc' } }, progress: { orderBy: { createdAt: 'desc' } }, enrollments: { include: { plan: true }, orderBy: { startsAt: 'desc' } } } }), prisma.plan.findMany({ orderBy: { name: 'asc' } })]);
  if (!student) notFound();
  return <section className="grid gap-6"><div><p className="text-sm font-semibold text-emerald-700">Aluno</p><h1 className="text-3xl font-bold">{student.fullName}</h1><p className="text-slate-600">{student.phone}</p></div><EditStudentForm student={student}/><ArchiveStudentButton studentId={student.id}/><div className="grid gap-6 lg:grid-cols-2"><div className="grid gap-6"><EnrollmentForm studentId={student.id} plans={plans}/><div className="rounded-xl border bg-white p-4"><h2 className="font-bold">Histórico de matrícula</h2>{student.enrollments.length?student.enrollments.map(item=><p className="mt-2 text-sm" key={item.id}>{item.plan.name} · {item.status}</p>):<p className="mt-2 text-sm text-slate-600">Sem matrícula ativa.</p>}</div><div><h2 className="mb-3 text-xl font-bold">Restrições e objetivos</h2><HealthProfileForm initial={student.health ?? undefined} studentId={student.id} /><div className="mt-3 grid gap-2">{student.healthHistory.map(item=><article className="rounded-lg border bg-white p-3 text-sm" key={item.id}><time className="text-xs text-slate-500">{item.createdAt.toLocaleDateString('pt-BR')}</time><p>{item.restrictions}</p></article>)}</div></div></div><div><h2 className="mb-3 text-xl font-bold">Evolução funcional</h2><ProgressForm studentId={student.id} /><div className="mt-4 grid gap-3">{student.progress.map((item) => <article className="rounded-lg border bg-white p-4" key={item.id}><time className="text-xs text-slate-500">{item.createdAt.toLocaleDateString('pt-BR')}</time><p>{item.note}</p></article>)}</div></div></div></section>;
}
