import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function createCheckoutSession(
  items: { name: string; price: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function retrieveSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
}
