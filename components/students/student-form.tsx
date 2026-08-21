'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function StudentForm({ plans, classSlots }: { plans: { id: string; name: string }[]; classSlots: { id: string; weekday: number; secondWeekday: number | null; startsTime: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch('/api/admin/students', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    if (!response.ok) return setError((await response.json().catch(() => ({}))).error || 'Não foi possível cadastrar o aluno.');
    formElement.reset();
    setError('');
    router.refresh();
  }

  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3" onSubmit={submit}>
    <input aria-label="Nome completo" className="rounded-lg border px-3 py-2" name="fullName" placeholder="Nome completo" required />
    <input aria-label="Telefone" className="rounded-lg border px-3 py-2" name="phone" placeholder="Telefone" required />
    <input aria-label="Data de nascimento" className="rounded-lg border px-3 py-2" name="birthDate" required type="date" />
    <input aria-label="E-mail de acesso" className="rounded-lg border px-3 py-2" name="email" placeholder="E-mail de acesso (opcional)" type="email" />
    <input aria-label="Senha de acesso" className="rounded-lg border px-3 py-2" name="password" minLength={8} placeholder="Senha inicial (opcional)" type="password" />
    <select className="rounded-lg border px-3 py-2" name="planId"><option value="">Plano (opcional)</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select>
    <select className="rounded-lg border px-3 py-2" name="classSlotId"><option value="">Turma (opcional)</option>{classSlots.map((slot) => <option key={slot.id} value={slot.id}>{slot.weekday === 1 ? 'Segunda' : slot.weekday === 2 ? 'Terça' : slot.weekday === 3 ? 'Quarta' : 'Quinta'}{slot.secondWeekday ? ' e ' + (slot.secondWeekday === 3 ? 'Quarta' : 'Quinta') : ''} · {slot.startsTime}</option>)}</select>
    <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white" type="submit">Cadastrar aluno</button>
    <p className="text-sm text-slate-600 md:col-span-3">E-mail e senha são opcionais, mas devem ser preenchidos juntos para liberar o portal do aluno.</p>
    {error ? <p className="text-sm text-red-700 md:col-span-3">{error}</p> : null}
  </form>;
}
