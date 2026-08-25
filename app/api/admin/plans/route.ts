import { NextResponse } from 'next/server';
import { requireFinancialAccess } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { UnauthorizedError } from '../../../../lib/permissions';
import { z } from 'zod';

const input = z.object({ name: z.string().trim().min(2).max(80), monthlyPriceCents: z.coerce.number().int().positive(), weeklyBookingLimit: z.coerce.number().int().min(1).max(7) });

export async function GET() { try { await requireFinancialAccess(); return NextResponse.json(await prisma.plan.findMany({ orderBy: { name: 'asc' } })); } catch (error) { if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 }); throw error; } }
export async function POST(request: Request) { try { await requireFinancialAccess(); return NextResponse.json(await prisma.plan.create({ data: input.parse(await request.json()) }), { status: 201 }); } catch (error) { if (error instanceof UnauthorizedError) return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 }); throw error; } }
