import Link from 'next/link';
import { prisma } from '../../../lib/db';
import { StudentForm } from '../../../components/students/student-form';

export default async function StudentsPage() {
  const students = await prisma.student.findMany({ orderBy: { fullName: 'asc' } });

  return <section className="grid gap-6">
    <div><p className="text-sm font-semibold text-emerald-700">Cadastro</p><h1 className="text-3xl font-bold">Alunos</h1></div>
    <StudentForm />
    <div className="overflow-hidden rounded-xl border bg-white">
      {students.length === 0 ? <p className="p-5 text-slate-600">Nenhum aluno cadastrado ainda.</p> : students.map((student) => <Link className="block border-b p-4 last:border-0 hover:bg-slate-50" href={`/admin/alunos/${student.id}`} key={student.id}><strong>{student.fullName}</strong><span className="ml-3 text-sm text-slate-600">{student.phone}</span></Link>)}
    </div>
  </section>;
}
