'use client';
import { useEffect, useState } from 'react';
type Invoice={id:string;amountCents:number;dueDate:string;referenceMonth:string;status:string};
const labels:Record<string,string>={PAID:'Pago',PENDING:'Pendente',OVERDUE:'Em atraso',VOID:'Cancelado'};
export function InvoiceList(){const [items,setItems]=useState<Invoice[]>([]);useEffect(()=>{fetch('/api/student/invoices').then(async r=>r.ok&&setItems(await r.json()));},[]);return <div className="grid gap-3">{items.map(i=><article className="rounded-xl border bg-white p-4" key={i.id}><strong>R$ {(i.amountCents/100).toFixed(2).replace('.',',')}</strong><p className="text-sm text-slate-600">Competência: {new Date(i.referenceMonth).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</p><p className="text-sm text-slate-600">Vencimento: {new Date(i.dueDate).toLocaleDateString('pt-BR')} · {labels[i.status]??i.status}</p></article>)}{!items.length?<p className="text-slate-600">Nenhuma mensalidade disponível.</p>:null}</div>}
