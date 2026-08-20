'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ArchiveStudentButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function archive() {
    if (!window.confirm('Arquivar este aluno? Matrículas e reservas futuras serão canceladas, mas o histórico será preservado.')) return;
    const response = await fetch(`/api/admin/students/${studentId}/archive`, { method: 'DELETE' });
    if (!response.ok) return setMessage('Não foi possível arquivar o aluno.');
    router.push('/admin/alunos');
    router.refresh();
  }
  return <div className="grid gap-2"><button className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700" onClick={archive} type="button">Arquivar aluno</button>{message ? <p className="text-sm text-red-700">{message}</p> : null}</div>;
}
