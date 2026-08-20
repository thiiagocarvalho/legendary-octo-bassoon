import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { z } from 'zod';

const input = z.object({ name: z.string().trim().min(2).max(80), monthlyPriceCents: z.coerce.number().int().positive(), weeklyBookingLimit: z.coerce.number().int().min(1).max(7) });

export async function GET() { await requireAdmin(); return NextResponse.json(await prisma.plan.findMany({ orderBy: { name: 'asc' } })); }
export async function POST(request: Request) { await requireAdmin(); return NextResponse.json(await prisma.plan.create({ data: input.parse(await request.json()) }), { status: 201 }); }
