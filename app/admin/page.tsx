import { DashboardCards } from '../../components/dashboard/dashboard-cards';
import { DailyMarketingAction } from '../../components/dashboard/daily-marketing-action';
export default function AdminHomePage() {
  return (
    <section>
      <p className="text-sm font-semibold text-emerald-700">Painel do estúdio</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Bem-vinda ao PilatesProCRM</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Cadastre seus alunos e mantenha as restrições e evoluções funcionais centralizadas e protegidas.</p>
      <DashboardCards />
      <DailyMarketingAction />
    </section>
  );
}
