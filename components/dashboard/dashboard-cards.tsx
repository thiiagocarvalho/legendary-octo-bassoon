'use client';

import { useEffect, useState } from 'react';
import { formatBirthdayDayMonth } from '../../lib/birthday-display';

type Person = { id: string; fullName: string };
type Birthday = Person & { birthDate: string };
type MonthlyForecast = { label: string; cents: number };
type Dashboard = { activeStudents: number; pendingInvoices: number; receivedCents: number; monthlyForecasts: MonthlyForecast[]; occupancyPercent: number; attendancePercent: number; birthdays: Birthday[]; studentsWithoutBooking: Person[]; lowFrequency: Person[] };

const money = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;

export function DashboardCards() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => { fetch('/api/admin/dashboard').then(async (response) => response.ok && setData(await response.json())); }, []);

  const values = data
    ? [['Alunos ativos', String(data.activeStudents)], ['Mensalidades pendentes', String(data.pendingInvoices)], ['Valor recebido até agora', money(data.receivedCents)], ...data.monthlyForecasts.map((item) => [`Receita prevista — ${item.label}`, money(item.cents)]), ['Ocupação da semana', `${data.occupancyPercent}%`], ['Presença (28 dias)', `${data.attendancePercent}%`]]
    : [['Alunos ativos', '—'], ['Mensalidades pendentes', '—'], ['Valor recebido até agora', '—'], ['Receita prevista', '—'], ['Ocupação da semana', '—'], ['Presença (28 dias)', '—']];
  const alert = (title: string, people: Person[], empty: string) => <section className="rounded-xl border bg-white p-4"><h2 className="font-bold">{title}</h2>{people.length ? <ul className="mt-2 list-disc pl-5">{people.map((student) => <li key={student.id}>{student.fullName}</li>)}</ul> : <p className="mt-2 text-slate-600">{empty}</p>}</section>;
  const birthdays = data?.birthdays ?? [];

  return <><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{values.map(([label, value]) => <article className="rounded-xl border bg-white p-4" key={label}><strong className="capitalize">{label}</strong><p className="mt-2 text-2xl font-bold text-emerald-700">{value}</p></article>)}</div><div className="mt-6 grid gap-4 lg:grid-cols-3"><section className="rounded-xl border bg-white p-4"><h2 className="font-bold">Aniversariantes</h2>{birthdays.length ? <ul className="mt-2 list-disc pl-5">{birthdays.map((student) => <li key={student.id}>{student.fullName} · {formatBirthdayDayMonth(student.birthDate)}</li>)}</ul> : <p className="mt-2 text-slate-600">Nenhum aniversariante nos próximos 7 dias.</p>}</section>{alert('Sem reserva nesta semana', data?.studentsWithoutBooking ?? [], 'Todos os alunos ativos têm reserva.')}{alert('Baixa frequência', data?.lowFrequency ?? [], 'Nenhum aluno abaixo de 4 presenças nos últimos 28 dias.')}</div></>;
}
