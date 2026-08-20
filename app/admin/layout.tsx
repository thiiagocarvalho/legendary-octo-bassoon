import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/aluno');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-5 px-5 py-4">
          <Link className="font-bold text-emerald-800" href="/admin">Pilates Gestão</Link>
          <Link className="text-sm font-medium text-slate-700" href="/admin/alunos">Alunos</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-5 md:p-8">{children}</main>
    </div>
  );
}
