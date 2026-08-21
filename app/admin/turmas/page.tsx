import { prisma } from '../../../lib/db';
import { ClassSlotForm } from '../../../components/schedule/class-slot-form';
import { CompleteDayPairForm } from '../../../components/schedule/complete-day-pair-form';
import { weekdayPairLabel } from '../../../lib/schedule-display';

export default async function ClassesPage() {
  const classes = await prisma.classSlot.findMany({ orderBy: [{ weekday: 'asc' }, { startsTime: 'asc' }] });

  return <section className="grid gap-6">
    <div><p className="text-sm font-semibold text-emerald-700">Agenda</p><h1 className="text-3xl font-bold">Turmas</h1><p className="mt-2 text-slate-600">Defina horários fixos e vagas para suas aulas de Pilates.</p></div>
    <ClassSlotForm />
    <div className="overflow-hidden rounded-xl border bg-white">{classes.length === 0 ? <p className="p-5 text-slate-600">Nenhuma turma cadastrada ainda.</p> : <table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-600"><tr><th className="p-4">Dias da turma</th><th className="p-4">Horário</th><th className="p-4">Duração</th><th className="p-4">Vagas</th></tr></thead><tbody>{classes.map((item: (typeof classes)[number]) => <tr className="border-t" key={item.id}><td className="p-4"><p>{weekdayPairLabel(item.weekday, item.secondWeekday)}</p>{item.secondWeekday === null ? <CompleteDayPairForm classSlotId={item.id} weekday={item.weekday}/> : null}</td><td className="p-4">{item.startsTime}</td><td className="p-4">{item.duration} min</td><td className="p-4">{item.capacity}</td></tr>)}</tbody></table>}</div>
  </section>;
}
