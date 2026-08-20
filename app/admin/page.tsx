export default function AdminHomePage() {
  return (
    <section>
      <p className="text-sm font-semibold text-emerald-700">Painel do estúdio</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Bem-vinda ao Pilates Gestão</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Cadastre seus alunos e mantenha as restrições e evoluções funcionais centralizadas e protegidas.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border bg-white p-4"><strong>Alunos ativos</strong><p className="mt-2 text-slate-500">Em breve</p></article><article className="rounded-xl border bg-white p-4"><strong>Mensalidades pendentes</strong><p className="mt-2 text-slate-500">Em breve</p></article><article className="rounded-xl border bg-white p-4"><strong>Aniversariantes</strong><p className="mt-2 text-slate-500">Em breve</p></article></div>
    </section>
  );
}
