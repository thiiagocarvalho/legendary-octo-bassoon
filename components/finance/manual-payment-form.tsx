'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { expectedManualPaymentCents } from '../../lib/manual-payments';

type Enrollment = { id: string; student: { fullName: string }; plan: { name: string; monthlyPriceCents: number } };

export function ManualPaymentForm({ enrollments }: { enrollments: Enrollment[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [monthsCovered, setMonthsCovered] = useState(1);
  const enrollment = enrollments.find((item) => item.id === enrollmentId);
  const expected = enrollment ? expectedManualPaymentCents(enrollment.plan.monthlyPriceCents, monthsCovered) : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = Object.fromEntries(new FormData(formElement));
    const response = await fetch('/api/admin/manual-payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, monthsCovered: Number(data.monthsCovered), amountCents: Math.round(Number(String(data.amount).replace(',', '.')) * 100) }),
    });

    setMessage(response.ok ? 'Pagamento registrado e mensalidades quitadas.' : 'Confira os dados do recebimento.');
    if (response.ok) {
      formElement.reset();
      setEnrollmentId('');
      setMonthsCovered(1);
      router.refresh();
    }
  }

  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3" onSubmit={submit}>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Aluno
      <select className="rounded-lg border px-3 py-2 font-normal" name="enrollmentId" onChange={(event) => setEnrollmentId(event.target.value)} required value={enrollmentId}>
        <option value="">Selecione o aluno</option>
        {enrollments.map((item) => <option value={item.id} key={item.id}>{item.student.fullName} · {item.plan.name}</option>)}
      </select>
    </label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Forma de pagamento
      <select className="rounded-lg border px-3 py-2 font-normal" name="method" defaultValue="PIX">
        <option value="PIX">Pix</option>
        <option value="CASH">Dinheiro</option>
        <option value="CARD_IN_PERSON">Cartão presencial</option>
      </select>
    </label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Meses pagos
      <input className="rounded-lg border px-3 py-2 font-normal" name="monthsCovered" min="1" max="24" onChange={(event) => setMonthsCovered(Number(event.target.value) || 1)} required type="number" value={monthsCovered} />
    </label>
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      Valor recebido
      <input className="rounded-lg border px-3 py-2 font-normal" name="amount" min="0.01" placeholder="Ex.: 350" required step="0.01" type="number" />
    </label>
    {expected !== null ? <p className="self-end text-sm text-slate-600">Valor esperado para {monthsCovered} mês(es): <strong>R$ {(expected / 100).toFixed(2).replace('.', ',')}</strong></p> : null}
    <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">
      Observação
      <input className="rounded-lg border px-3 py-2 font-normal" name="notes" placeholder="Opcional" />
    </label>
    <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white md:col-span-3">Confirmar recebimento</button>
    {message ? <p className="text-sm md:col-span-3">{message}</p> : null}
  </form>;
}
