import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/db';
import { HealthProfileForm } from '../../../../components/students/health-profile-form';
import { ProgressForm } from '../../../../components/students/progress-form';

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { health: true, progress: { orderBy: { createdAt: 'desc' } } } });
  if (!student) notFound();
  return <section className="grid gap-6"><div><p className="text-sm font-semibold text-emerald-700">Aluno</p><h1 className="text-3xl font-bold">{student.fullName}</h1><p className="text-slate-600">{student.phone}</p></div><div className="grid gap-6 lg:grid-cols-2"><div><h2 className="mb-3 text-xl font-bold">Restrições e objetivos</h2><HealthProfileForm initial={student.health ?? undefined} studentId={student.id} /></div><div><h2 className="mb-3 text-xl font-bold">Evolução funcional</h2><ProgressForm studentId={student.id} /><div className="mt-4 grid gap-3">{student.progress.map((item) => <article className="rounded-lg border bg-white p-4" key={item.id}><time className="text-xs text-slate-500">{item.createdAt.toLocaleDateString('pt-BR')}</time><p>{item.note}</p></article>)}</div></div></div></section>;
}
