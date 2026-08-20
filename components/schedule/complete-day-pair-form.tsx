'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CompleteDayPairForm({ classSlotId, weekday }: { classSlotId: string; weekday: number }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const dayPair = [1, 3].includes(weekday) ? 'MON_WED' : [2, 4].includes(weekday) ? 'TUE_THU' : null;
  if (!dayPair) return <span className="text-sm text-amber-700">Esta turma não pertence às combinações Segunda/Quarta ou Terça/Quinta.</span>;
  async function complete() { const response = await fetch(`/api/admin/class-slots/${classSlotId}/day-pair`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dayPair }) }); setMessage(response.ok ? 'Dias completados.' : 'Não foi possível completar os dias.'); if (response.ok) router.refresh(); }
  return <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-amber-700">Falta o segundo dia.</span><button className="rounded border border-emerald-700 px-2 py-1 text-sm text-emerald-800" onClick={complete} type="button">Completar como {dayPair === 'MON_WED' ? 'Segunda e Quarta' : 'Terça e Quinta'}</button>{message ? <span className="text-sm">{message}</span> : null}</div>;
}
