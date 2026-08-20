'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function StudentForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/students', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    if (!response.ok) return setError('Confira os dados e tente novamente.');
    event.currentTarget.reset();
    setError('');
    router.refresh();
  }

  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-4" onSubmit={submit}>
    <input aria-label="Nome completo" className="rounded-lg border px-3 py-2" name="fullName" placeholder="Nome completo" required />
    <input aria-label="Telefone" className="rounded-lg border px-3 py-2" name="phone" placeholder="Telefone" required />
    <input aria-label="Data de nascimento" className="rounded-lg border px-3 py-2" name="birthDate" required type="date" />
    <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white" type="submit">Cadastrar aluno</button>
    {error ? <p className="text-sm text-red-700 md:col-span-4">{error}</p> : null}
  </form>;
}
