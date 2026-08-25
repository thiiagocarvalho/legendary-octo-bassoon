import { NextResponse } from 'next/server';
import { requireFinancialAccess } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { createInvoice, createMonthlyInvoices, markOverdueInvoices } from '../../../../server/services/invoices';
import { UnauthorizedError } from '../../../../lib/permissions';
export async function GET() { try { await requireFinancialAccess(); await markOverdueInvoices(); return NextResponse.json(await prisma.invoice.findMany({ include: { enrollment: { include: { student: true, plan: true } } }, orderBy: { dueDate: 'asc' } })); } catch (error) { if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 }); throw error; } }
export async function POST(request: Request) { try { await requireFinancialAccess(); const { enrollmentId, dueDate, action } = await request.json(); if (action === 'GENERATE_MONTH') return NextResponse.json(await createMonthlyInvoices()); if (!enrollmentId || !dueDate) return NextResponse.json({ error: 'Matrícula e vencimento são obrigatórios.' }, { status: 400 }); return NextResponse.json(await createInvoice(enrollmentId, new Date(dueDate)), { status: 201 }); } catch (error) { if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 }); throw error; } }
