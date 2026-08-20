import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
export async function GET() { const user = await requireStudent(); if (!user.studentId) return NextResponse.json({ error: 'Perfil de aluno não vinculado.' }, { status: 403 }); return NextResponse.json(await prisma.invoice.findMany({ where: { enrollment: { studentId: user.studentId } }, orderBy: { dueDate: 'desc' } })); }
