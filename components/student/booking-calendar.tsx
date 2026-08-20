'use client';
import { useEffect, useState } from 'react';
type Occurrence = { id: string; startsAt: string; capacity: number; occupied: number };
const format = (value: string) => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
export function BookingCalendar() {
  const [items, setItems] = useState<Occurrence[]>([]); const [message, setMessage] = useState('');
  async function load() { const response = await fetch('/api/student/bookings'); if (response.ok) setItems(await response.json()); }
  useEffect(() => { void load(); }, []);
  async function reserve(occurrenceId: string) { const response = await fetch('/api/student/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ occurrenceId }) }); setMessage(response.ok ? 'Reserva confirmada.' : 'Não foi possível reservar: vaga, plano ou limite semanal.'); if (response.ok) void load(); }
  return <div className="grid gap-3">{items.map((item) => <article className="rounded-xl border bg-white p-4" key={item.id}><p className="font-semibold capitalize">{format(item.startsAt)}</p><p className="mt-1 text-sm text-slate-600">{item.capacity - item.occupied} vagas disponíveis</p><button className="mt-3 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={item.occupied >= item.capacity} onClick={() => reserve(item.id)}>Reservar</button></article>)}{message ? <p aria-live="polite">{message}</p> : null}{!items.length ? <p className="text-slate-600">Nenhum horário disponível.</p> : null}</div>;
}
