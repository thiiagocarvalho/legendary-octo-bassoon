import { NextResponse } from 'next/server';
import { requireFinancialAccess } from '../../../../lib/auth';
import { prisma, type TransactionClient } from '../../../../lib/db';
import { createInvoice } from '../../../../server/services/invoices';
import { UnauthorizedError } from '../../../../lib/permissions';
export async function POST(request: Request) { try { await requireFinancialAccess(); const { studentId, planId } = await request.json(); if (!studentId || !planId) return NextResponse.json({ error:'Matrícula e plano são obrigatórios.'},{status:400}); const enrollment=await prisma.$transaction(async (tx: TransactionClient)=>{await tx.enrollment.updateMany({where:{studentId,status:{in:['ACTIVE','PENDING']}},data:{status:'CANCELED'}});return tx.enrollment.create({data:{studentId,planId,status:'PENDING',startsAt:new Date()}})}); await createInvoice(enrollment.id,new Date()); return NextResponse.json(enrollment,{status:201}); } catch(error) { if(error instanceof UnauthorizedError) return NextResponse.json({error:'Acesso restrito ao administrador.'},{status:403}); throw error; } }
