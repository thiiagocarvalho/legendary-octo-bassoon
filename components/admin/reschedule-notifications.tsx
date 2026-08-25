'use client';

import { useState } from 'react';

type Notification = { id: string; student: { fullName: string }; content: string; createdAt: Date | string };

export function RescheduleNotifications({ notifications: initialNotifications }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [error, setError] = useState('');

  async function erase(notificationId: string) {
    if (!window.confirm('Apagar este aviso de remarcação?')) return;
    setError('');
    const response = await fetch(`/api/admin/remarcacoes/${notificationId}`, { method: 'DELETE' });
    if (!response.ok) return setError('Não foi possível apagar o aviso.');
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
  }

  return <div className="mt-4 grid gap-3">{notifications.map((notification) => <article className="rounded-xl border bg-white p-4" key={notification.id}><div className="flex items-start justify-between gap-3"><div><strong>{notification.student.fullName}</strong><p className="mt-1">{notification.content}</p><time className="mt-1 block text-sm text-slate-500">{new Date(notification.createdAt).toLocaleString('pt-BR')}</time></div><button className="rounded-lg border border-red-300 px-3 py-2 font-semibold text-red-700" onClick={() => erase(notification.id)}>Apagar</button></div></article>)}{!notifications.length ? <p className="text-slate-600">Nenhuma remarcação registrada.</p> : null}{error ? <p className="text-red-700">{error}</p> : null}</div>;
}
