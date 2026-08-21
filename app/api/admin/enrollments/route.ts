import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { createInvoice } from '../../../../server/services/invoices';
export async function POST(request: Request) { await requireAdmin(); const { studentId, planId } = await request.json(); if (!studentId || !planId) return NextResponse.json({ error:'Aluno e plano são obrigatórios.'},{status:400}); const enrollment=await prisma.$transaction(async (tx: Prisma.TransactionClient)=>{await tx.enrollment.updateMany({where:{studentId,status:{in:['ACTIVE','PENDING']}},data:{status:'CANCELED'}});return tx.enrollment.create({data:{studentId,planId,status:'PENDING',startsAt:new Date()}})}); await createInvoice(enrollment.id,new Date()); return NextResponse.json(enrollment,{status:201}); }
