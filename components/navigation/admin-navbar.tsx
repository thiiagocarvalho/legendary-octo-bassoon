'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PilatesProBrand } from '../brand/pilates-pro-brand';
import { adminNavigationLinks, employeeNavigationLinks } from './navigation-links';

export function AdminNavbar({ role }: { role: 'ADMIN' | 'EMPLOYEE' }) {
  const [open, setOpen] = useState(false);
  const links = role === 'ADMIN' ? adminNavigationLinks : employeeNavigationLinks;
  return <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
    <nav className="mx-auto max-w-6xl px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <PilatesProBrand href="/admin" />
        <div className="hidden items-center gap-4 lg:flex">{links.map((item) => <Link className="text-sm font-medium text-slate-700 hover:text-black" href={item.href} key={item.href}>{item.label}</Link>)}</div>
        <button aria-expanded={open} className="rounded-lg border px-4 py-2 font-semibold lg:hidden" onClick={() => setOpen((value) => !value)} type="button">Menu</button>
      </div>
      {open ? <div className="mt-3 grid gap-1 border-t pt-3 lg:hidden">{links.map((item) => <Link className="rounded-lg px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-100" href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}</div> : null}
    </nav>
  </header>;
}
