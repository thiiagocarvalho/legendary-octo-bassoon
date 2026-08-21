'use client';

import { useState } from 'react';
import { removeStudentMessage } from '../../lib/student-message-list';

export type VisibleStudentMessage = { id: string; student: { fullName: string }; content: string; createdAt: Date | string };

export function StudentMessages({ messages: initialMessages, compact = false }: { messages: VisibleStudentMessage[]; compact?: boolean }) {
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState('');

  async function erase(messageId: string) {
    if (!window.confirm('Apagar esta mensagem definitivamente?')) return;
    setError('');
    const response = await fetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Não foi possível apagar a mensagem.');
      return;
    }
    setMessages((current) => removeStudentMessage(current, messageId));
  }

  return <div className="mt-3 grid gap-3">{messages.map((message) => <article className={compact ? 'rounded-lg bg-slate-50 p-3' : 'rounded-xl border bg-white p-4'} key={message.id}><div className="flex items-start justify-between gap-3"><div><strong>{message.student.fullName}</strong><p className="mt-1">{message.content}</p><time className="mt-1 block text-sm text-slate-500">{new Date(message.createdAt).toLocaleString('pt-BR')}</time></div><button className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700" onClick={() => erase(message.id)}>Apagar</button></div></article>)}{!messages.length ? <p className="text-slate-600">Nenhuma mensagem recebida.</p> : null}{error ? <p className="text-red-700">{error}</p> : null}</div>;
}
