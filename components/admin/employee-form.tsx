'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function EmployeeForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch('/api/admin/employees', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Conta da funcionária criada.' : (data.error ?? 'Não foi possível criar a conta.'));
    if (response.ok) { form.reset(); router.refresh(); }
  }

  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3" onSubmit={submit}><label className="grid gap-1 text-sm font-medium">Nome<input className="rounded-lg border px-3 py-2 font-normal" name="fullName" required/></label><label className="grid gap-1 text-sm font-medium">E-mail<input className="rounded-lg border px-3 py-2 font-normal" name="email" required type="email"/></label><label className="grid gap-1 text-sm font-medium">Senha inicial<input className="rounded-lg border px-3 py-2 font-normal" minLength={8} name="password" required type="password"/></label><button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white md:col-span-3">Criar conta de funcionária</button>{message ? <p className="text-sm md:col-span-3">{message}</p> : null}</form>;
}
