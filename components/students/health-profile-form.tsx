'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function HealthProfileForm({ studentId, initial }: { studentId: string; initial?: { restrictions: string; goals: string | null; observations: string | null } }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/students/${studentId}/health`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(form), consentedAt: new Date().toISOString() }) });
    setMessage(response.ok ? 'Ficha salva com segurança.' : 'Não foi possível salvar a ficha.');
    if (response.ok) router.refresh();
  }
  return <form className="grid gap-3 rounded-xl border bg-white p-5" onSubmit={submit}>
    <label className="grid gap-1 font-medium">Restrições<textarea className="rounded-lg border p-2" defaultValue={initial?.restrictions} name="restrictions" required rows={4} /></label>
    <label className="grid gap-1 font-medium">Objetivos<textarea className="rounded-lg border p-2" defaultValue={initial?.goals ?? ''} name="goals" rows={3} /></label>
    <label className="grid gap-1 font-medium">Observações<textarea className="rounded-lg border p-2" defaultValue={initial?.observations ?? ''} name="observations" rows={3} /></label>
    <p className="text-sm text-slate-600">Ao salvar, você confirma o consentimento do aluno para este acompanhamento.</p>
    <button className="w-fit rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white" type="submit">Salvar ficha</button>{message ? <p aria-live="polite">{message}</p> : null}
  </form>;
}
