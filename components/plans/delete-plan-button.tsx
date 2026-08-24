'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeletePlanButton({ planId }: { planId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function remove() {
    if (!window.confirm('Excluir este plano? A ação só será permitida se ele não estiver vinculado a nenhum aluno ou registro financeiro.')) return;
    setMessage('');
    const response = await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(data.error ?? 'Não foi possível excluir o plano.');
    router.refresh();
  }

  return <div className="grid gap-1"><button className="rounded border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={remove} type="button">Excluir plano</button>{message ? <p className="text-xs text-red-700">{message}</p> : null}</div>;
}
