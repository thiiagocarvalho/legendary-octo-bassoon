import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
import { PilatesProBrand } from '../../components/brand/pilates-pro-brand';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/aluno');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-5 px-5 py-4">
          <PilatesProBrand href="/admin"/>
          <Link title="Cadastre, consulte e edite os alunos" className="text-sm font-medium text-slate-700" href="/admin/alunos">Alunos</Link>
          <Link title="Crie turmas com dias, horários e vagas" className="text-sm font-medium text-slate-700" href="/admin/turmas">Turmas</Link>
          <Link title="Veja as aulas e marque presença ou falta" className="text-sm font-medium text-slate-700" href="/admin/agenda">Agenda</Link>
          <Link title="Configure valores e aulas por semana" className="text-sm font-medium text-slate-700" href="/admin/planos">Planos</Link>
          <Link title="Registre pagamentos e acompanhe mensalidades" className="text-sm font-medium text-slate-700" href="/admin/financeiro">Financeiro</Link>
          <Link title="Analise recebimentos, pendências e frequência por mês" className="text-sm font-medium text-slate-700" href="/admin/relatorios">Relatórios</Link>
          <Link title="Leia mensagens enviadas pelos alunos" className="text-sm font-medium text-slate-700" href="/admin/mensagens">Mensagens</Link>
          <Link title="Abra cada aula e faça a chamada dos alunos" className="text-sm font-medium text-slate-700" href="/admin/chamada">Lista de chamada</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-5 md:p-8">{children}</main>
    </div>
  );
}
