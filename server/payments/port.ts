export type PaymentMethod = 'PIX' | 'CARD';

export interface PaymentGateway {
  createCheckout(input: { invoiceId: string; amountCents: number; method: PaymentMethod }): Promise<{ checkoutUrl: string; externalId: string }>;
}
