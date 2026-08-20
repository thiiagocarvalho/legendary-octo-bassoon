import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { createInvoice, createMonthlyInvoices, markOverdueInvoices } from '../../../../server/services/invoices';
export async function GET() { await requireAdmin(); await markOverdueInvoices(); return NextResponse.json(await prisma.invoice.findMany({ include: { enrollment: { include: { student: true, plan: true } } }, orderBy: { dueDate: 'asc' } })); }
export async function POST(request: Request) { await requireAdmin(); const { enrollmentId, dueDate, action } = await request.json(); if (action === 'GENERATE_MONTH') return NextResponse.json(await createMonthlyInvoices()); if (!enrollmentId || !dueDate) return NextResponse.json({ error: 'Matrícula e vencimento são obrigatórios.' }, { status: 400 }); return NextResponse.json(await createInvoice(enrollmentId, new Date(dueDate)), { status: 201 }); }
