import { redirect } from 'next/navigation';
import { EmployeeForm } from '../../../components/admin/employee-form';
import { getSessionUser } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export default async function TeamPage() {
  const user = await getSessionUser();
  if (user?.role !== 'ADMIN') redirect('/admin');
  const employees = await prisma.user.findMany({ where: { role: 'EMPLOYEE' }, select: { id: true, fullName: true, email: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  return <section className="grid gap-6"><div><p className="text-sm font-semibold text-emerald-700">Administração</p><h1 className="text-3xl font-bold">Equipe</h1><p className="mt-2 text-slate-600">Crie acessos para funcionárias sem acesso a dados financeiros.</p></div><EmployeeForm/><section className="rounded-xl border bg-white"><h2 className="p-4 font-bold">Funcionárias cadastradas</h2>{employees.length ? employees.map((employee) => <article className="border-t p-4" key={employee.id}><strong>{employee.fullName ?? 'Funcionária'}</strong><p className="text-sm text-slate-600">{employee.email}</p></article>) : <p className="border-t p-4 text-slate-600">Nenhuma funcionária cadastrada.</p>}</section></section>;
}
