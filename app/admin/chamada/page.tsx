import { AdminAgenda } from '../../../components/schedule/admin-agenda';

export default function CallListPage() {
  return <section><p className="text-sm font-semibold text-amber-700">Operação do estúdio</p><h1 className="text-3xl font-bold">Lista de chamada</h1><p className="my-3 text-slate-600">Abra uma aula para marcar cada aluno como Presente ou Faltou.</p><AdminAgenda/></section>;
}
