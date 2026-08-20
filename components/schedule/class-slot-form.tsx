'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
export function ClassSlotForm() {
  const router = useRouter(); const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); const r = await fetch('/api/admin/class-slots',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(form))}); setMessage(r.ok?'Turma criada.':'Verifique os dados.'); if(r.ok){e.currentTarget.reset();router.refresh();} }
  return <form className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-4" onSubmit={submit}><select aria-label="Dia" className="rounded border p-2" name="weekday"><option value="1">Segunda</option><option value="2">Terça</option><option value="3">Quarta</option><option value="4">Quinta</option><option value="5">Sexta</option></select><input aria-label="Horário" className="rounded border p-2" name="startsTime" required type="time"/><input aria-label="Duração" className="rounded border p-2" defaultValue="60" name="duration" required type="number"/><input aria-label="Vagas" className="rounded border p-2" defaultValue="4" name="capacity" required type="number"/><button className="rounded bg-emerald-700 px-3 py-2 font-semibold text-white md:col-span-4">Criar turma</button>{message?<p aria-live="polite" className="md:col-span-4">{message}</p>:null}</form>;
}
