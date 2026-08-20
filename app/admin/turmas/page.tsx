import { prisma } from '../../../lib/db';
import { ClassSlotForm } from '../../../components/schedule/class-slot-form';

export default async function ClassesPage() {
  const classes = await prisma.classSlot.findMany({ orderBy: [{ weekday: 'asc' }, { startsTime: 'asc' }] });

  return <section className="grid gap-6">
    <div><p className="text-sm font-semibold text-emerald-700">Agenda</p><h1 className="text-3xl font-bold">Turmas</h1><p className="mt-2 text-slate-600">Defina horários fixos e vagas para suas aulas de Pilates.</p></div>
    <ClassSlotForm />
    <div className="rounded-xl border bg-white p-5 text-slate-600">{classes.length === 0 ? 'Nenhuma turma cadastrada ainda.' : classes.map((item) => <p key={item.id}>{item.startsTime} · {item.capacity} vagas</p>)}</div>
  </section>;
}
