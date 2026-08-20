'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.replace('/inicio');
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-sm font-medium" htmlFor="email">
        E-mail
        <input className="rounded-lg border border-slate-300 px-3 py-2" id="email" name="email" required type="email" />
      </label>
      <label className="grid gap-1 text-sm font-medium" htmlFor="password">
        Senha
        <input className="rounded-lg border border-slate-300 px-3 py-2" id="password" name="password" required type="password" />
      </label>
      {error ? <p aria-live="polite" className="text-sm text-red-700">{error}</p> : null}
      <button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={loading} type="submit">
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
