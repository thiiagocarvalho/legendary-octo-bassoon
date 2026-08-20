'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function PlanForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = Object.fromEntries(new FormData(formElement));
    const price = Number(String(data.monthlyPrice).replace(',', '.')) * 100;
    const response = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, monthlyPriceCents: Math.round(price) }),
    });

    setMessage(response.ok ? 'Plano cadastrado.' : 'Confira os dados.');
    if (response.ok) {
      formElement.reset();
      router.refresh();
    }
  }

  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-4" onSubmit={submit}>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Nome do plano
      <input className="rounded-lg border px-3 py-2 font-normal" name="name" placeholder="Ex.: Pilates 2x por semana" required />
    </label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Valor mensal
      <input className="rounded-lg border px-3 py-2 font-normal" name="monthlyPrice" placeholder="Ex.: 350" required type="number" min="1" step="0.01" />
    </label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Aulas por semana
      <input className="rounded-lg border px-3 py-2 font-normal" name="weeklyBookingLimit" defaultValue="2" required type="number" min="1" max="7" />
    </label>
    <button className="self-end rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">Cadastrar plano</button>
    {message ? <p className="text-sm md:col-span-4">{message}</p> : null}
  </form>;
}
