'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ProgressForm({ studentId }: { studentId: string }) {
  const router = useRouter(); const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const response = await fetch(`/api/admin/students/${studentId}/progress`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) }); setMessage(response.ok ? 'Evolução registrada.' : 'Não foi possível registrar.'); if (response.ok) { formElement.reset(); router.refresh(); } }
  return <form className="grid gap-3 rounded-xl border bg-white p-5" onSubmit={submit}><label className="grid gap-1 font-medium">Nova evolução<textarea className="rounded-lg border p-2" name="note" required rows={4} /></label><button className="w-fit rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white" type="submit">Registrar evolução</button>{message ? <p aria-live="polite">{message}</p> : null}</form>;
}
