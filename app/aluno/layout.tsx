import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
export default async function StudentLayout({children}:{children:React.ReactNode}){const user=await getSessionUser();if(!user)redirect('/login');if(user.role!=='STUDENT')redirect('/admin');return <div className="min-h-screen bg-slate-50"><header className="border-b bg-white"><nav className="mx-auto flex max-w-md gap-4 p-4"><Link className="font-bold text-emerald-800" href="/aluno">Meu Pilates</Link><Link className="text-sm" href="/aluno/agenda">Agenda</Link><Link className="text-sm" href="/aluno/financeiro">Mensalidade</Link></nav></header>{children}</div>}
