'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function remove() {
    if (!window.confirm('Excluir definitivamente este aluno? Todos os dados, matrículas, mensalidades, pagamentos, reservas e histórico clínico serão apagados sem possibilidade de recuperação.')) return;
    const response = await fetch(`/api/admin/students/${studentId}/delete`, { method: 'DELETE' });
    if (!response.ok) return setMessage('Não foi possível excluir o aluno.');
    router.push('/admin/alunos');
    router.refresh();
  }
  return <div className="grid gap-2"><button className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700" onClick={remove} type="button">Excluir aluno definitivamente</button><p className="text-sm text-red-700">Esta ação não pode ser desfeita.</p>{message ? <p className="text-sm text-red-700">{message}</p> : null}</div>;
}
