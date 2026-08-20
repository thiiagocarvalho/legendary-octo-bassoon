import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { PaymentGateway } from './port';

export class MercadoPagoGateway implements PaymentGateway {
  async createCheckout(input: { invoiceId: string; amountCents: number; method: 'PIX' | 'CARD' }) {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const appUrl = process.env.APP_URL;
    if (!token || !appUrl) throw new Error('Pagamento ainda não configurado.');
    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = await new Preference(client).create({ body: { external_reference: input.invoiceId, items: [{ id: input.invoiceId, title: 'Mensalidade Pilates', quantity: 1, unit_price: input.amountCents / 100, currency_id: 'BRL' }], notification_url: `${appUrl}/api/payments/webhook` } });
    return { externalId: preference.id!, checkoutUrl: preference.init_point! };
  }
}
