import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
export async function POST(request: Request) { await requireAdmin(); const { studentId, planId } = await request.json(); if (!studentId || !planId) return NextResponse.json({ error:'Aluno e plano são obrigatórios.'},{status:400}); return NextResponse.json(await prisma.enrollment.create({data:{studentId,planId,status:'ACTIVE',startsAt:new Date()}}),{status:201}); }
