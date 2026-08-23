import Link from 'next/link';
import { studentNavigationLinks } from './navigation-links';

export function StudentNavbar() {
  return <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur"><nav className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">{studentNavigationLinks.map((item) => <Link className="rounded-lg px-2 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100" href={item.href} key={item.href}>{item.label}</Link>)}</nav></header>;
}
