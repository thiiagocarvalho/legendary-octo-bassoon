import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { enrollmentStatusAfterApprovedPayment } from '../../../../server/services/enrollment-payment';

function signatureIsValid(request: Request, paymentId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id') ?? '';
  if (!secret || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!parts.ts || !parts.v1) return false;
  const expected = createHmac('sha256', secret).update(`id:${paymentId};request-id:${requestId};ts:${parts.ts};`).digest('hex');
  return expected.length === parts.v1.length && timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

export async function POST(request: Request) {
  const body = await request.json(); const paymentId = String(body?.data?.id ?? '');
  if (!paymentId || !signatureIsValid(request, paymentId)) return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ error: 'Pagamento não configurado.' }, { status: 503 });
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
  const payment = await response.json();
  if (payment.status === 'approved' && payment.external_reference) {
    const invoice = await prisma.invoice.update({ where: { id: payment.external_reference }, data: { status: 'PAID' }, include: { enrollment: true } }).catch(() => null);
    if (invoice) await prisma.enrollment.update({ where: { id: invoice.enrollmentId }, data: { status: enrollmentStatusAfterApprovedPayment(invoice.enrollment.status) as 'ACTIVE' | 'PENDING' | 'OVERDUE' | 'CANCELED' } });
  }
  return NextResponse.json({ received: true });
}
