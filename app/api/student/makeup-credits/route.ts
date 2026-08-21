import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../lib/auth';
import { availableMakeupCredits } from '../../../../server/services/makeup-credits';

export async function GET() { const user = await requireStudent(); if (!user.studentId) return NextResponse.json({ error: 'Perfil de aluno não vinculado.' }, { status: 403 }); return NextResponse.json(await availableMakeupCredits(user.studentId)); }
