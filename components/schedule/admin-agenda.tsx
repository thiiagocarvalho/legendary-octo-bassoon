'use client';

import { useEffect, useState } from 'react';

type RosterStudent = { id: string; fullName: string };
type RosterItem = { student: RosterStudent; bookingId: string | null; status: string };
type Item = {
  id: string;
  startsAt: string;
  classSlot: { capacity: number; weekday: number; secondWeekday: number | null };
  roster: RosterItem[];
};

export function AdminAgenda() {
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const response = await fetch('/api/admin/agenda');
    if (response.ok) setItems(await response.json());
  }

  useEffect(() => { void load(); }, []);

  async function mark(occurrenceId: string, studentId: string, status: 'PRESENT' | 'ABSENT') {
    const response = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ occurrenceId, studentId, status }),
    });
    if (!response.ok) window.alert('Não foi possível registrar a presença.');
    else void load();
  }

  function card(item: Item) {
    const used = item.roster.length;
    return <article className="rounded-xl border bg-white p-4" key={item.id}>
      <div className="flex flex-wrap justify-between gap-3">
        <strong className="text-lg">{new Date(item.startsAt).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${used >= item.classSlot.capacity ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{used}/{item.classSlot.capacity} alunos</span>
      </div>
      {item.roster.length ? <ul className="mt-3 grid gap-2">
        {item.roster.map((entry) => <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-3" key={entry.student.id}>
          <span className="font-semibold">{entry.student.fullName}<small className="ml-2 font-normal text-slate-500">{entry.status === 'PRESENT' ? 'Presente' : entry.status === 'ABSENT' ? 'Faltou' : ''}</small></span>
          <span className="flex gap-2">
            <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => mark(item.id, entry.student.id, 'PRESENT')}>Presente</button>
            <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => mark(item.id, entry.student.id, 'ABSENT')}>Faltou</button>
          </span>
        </li>)}
      </ul> : <p className="mt-3 text-sm text-slate-600">Nenhum aluno matriculado neste horário.</p>}
    </article>;
  }

  const mondayWednesday = items.filter((item) => [1, 3].includes(item.classSlot.weekday));
  const tuesdayThursday = items.filter((item) => [2, 4].includes(item.classSlot.weekday));
  const groups: Array<[string, Item[]]> = [['Aulas de Segunda e Quarta', mondayWednesday], ['Aulas de Terça e Quinta', tuesdayThursday]];

  return <div className="grid gap-4">
    {groups.map(([title, list]) => <details className="rounded-xl border bg-white" key={title}>
      <summary className="cursor-pointer p-4 text-lg font-bold">{title} · {list.length} aula(s)</summary>
      <div className="grid gap-4 border-t p-4">{list.map(card)}</div>
    </details>)}
    {!items.length ? <p className="text-slate-600">Não há aulas futuras. Cadastre uma turma para gerar horários.</p> : null}
  </div>;
}
