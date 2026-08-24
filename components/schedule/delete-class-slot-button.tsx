'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteClassSlotButton({ classSlotId }: { classSlotId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function remove() {
    if (!window.confirm('Excluir esta turma? Esta ação remove os horários ainda sem alunos e sem aulas registradas.')) return;
    setMessage('');
    const response = await fetch(`/api/admin/class-slots/${classSlotId}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(data.error ?? 'Não foi possível excluir a turma.');
    router.refresh();
  }

  return <div className="grid gap-1"><button className="rounded border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={remove} type="button">Excluir turma</button>{message ? <p className="max-w-64 text-xs text-red-700">{message}</p> : null}</div>;
}
