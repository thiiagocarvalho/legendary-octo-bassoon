import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
import { AdminNavbar } from '../../components/navigation/admin-navbar';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/aluno');

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <main className="mx-auto max-w-6xl p-4 sm:p-5 md:p-8">{children}</main>
    </div>
  );
}
