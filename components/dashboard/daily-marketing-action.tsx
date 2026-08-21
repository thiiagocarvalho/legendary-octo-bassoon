'use client';
import { useState } from 'react';
import { dailyMarketingAction } from '../../lib/daily-marketing-action';
export function DailyMarketingAction(){const action=dailyMarketingAction();const [done,setDone]=useState(false);return <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-bold text-emerald-800">Ação de marketing de hoje</p><h2 className="mt-1 text-xl font-bold">{action.title}</h2><p className="mt-2">{action.text}</p><p className="mt-2 text-sm font-semibold text-emerald-800">Objetivo: {action.goal}</p><button className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white" onClick={()=>setDone(true)}>{done?'Concluída hoje ✓':'Marcar como concluída'}</button></section>}
