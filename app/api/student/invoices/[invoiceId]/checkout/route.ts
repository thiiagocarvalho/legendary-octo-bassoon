import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { MercadoPagoGateway } from '../../../../../../server/payments/mercado-pago';
export async function POST(_: Request,{params}:{params:Promise<{invoiceId:string}>}){const user=await requireStudent();const {invoiceId}=await params;const invoice=await prisma.invoice.findFirst({where:{id:invoiceId,enrollment:{studentId:user.studentId}},include:{enrollment:true}});if(!invoice)return NextResponse.json({error:'Fatura não encontrada.'},{status:404});const checkout=await new MercadoPagoGateway().createCheckout({invoiceId,amountCents:invoice.amountCents,method:'PIX'});await prisma.invoice.update({where:{id:invoiceId},data:checkout});return NextResponse.json(checkout);}
