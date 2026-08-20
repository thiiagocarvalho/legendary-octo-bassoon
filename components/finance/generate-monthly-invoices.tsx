'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function GenerateMonthlyInvoices(){const router=useRouter();const [message,setMessage]=useState('');async function generate(){const r=await fetch('/api/admin/invoices',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'GENERATE_MONTH'})});setMessage(r.ok?'Mensalidades do mês atualizadas.':'Não foi possível gerar as mensalidades.');if(r.ok)router.refresh();}return <div className="mt-4"><button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white" onClick={generate}>Gerar mensalidades do mês</button>{message?<p className="mt-2 text-sm">{message}</p>:null}</div>}
