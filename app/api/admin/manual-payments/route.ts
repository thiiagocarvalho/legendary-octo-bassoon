import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { UnauthorizedError } from '../../../../lib/permissions';
import { recordManualPayment } from '../../../../server/services/manual-payments';

export async function GET() { await requireAdmin(); return NextResponse.json(await prisma.manualPayment.findMany({ include: { enrollment: { include: { student: true } } }, orderBy: { receivedAt: 'desc' } })); }
export async function POST(request: Request) { try { const admin = await requireAdmin(); return NextResponse.json(await recordManualPayment(await request.json(), admin.id), { status: 201 }); } catch (error) { if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 403 }); const message = error instanceof Error ? error.message : 'Não foi possível registrar o recebimento.'; return NextResponse.json({ error: message }, { status: 400 }); } }
