'use client';

import { useState } from 'react';
import { studentMessageError } from '../../lib/student-message-errors';

export function MessageForm() {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const canSend = Boolean(content.trim());

  async function send() {
    if (!canSend) {
      setMessage('Escreva uma mensagem antes de enviar.');
      return;
    }

    try {
      const response = await fetch('/api/student/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(studentMessageError(payload));
        return;
      }

      setContent('');
      setMessage('Mensagem enviada para o estúdio.');
    } catch {
      setMessage('Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.');
    }
  }

  return <section className="mt-6 rounded-xl border bg-white p-4"><h2 className="text-xl font-bold">Falar com o estúdio</h2><textarea className="mt-3 w-full rounded-lg border p-3 text-lg" value={content} onChange={e => setContent(e.target.value)} placeholder="Escreva sua mensagem"/><button className="mt-3 w-full rounded-lg bg-emerald-700 p-3 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400" disabled={!canSend} onClick={send}>Enviar mensagem</button>{message ? <p className="mt-2">{message}</p> : null}</section>;
}
