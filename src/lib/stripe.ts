import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

export type PlanId = "starter" | "pro" | "agency";

export function getStripePriceId(plan: PlanId): string | undefined {
  switch (plan) {
    case "starter":
      return process.env.STRIPE_PRICE_ID_STARTER;
    case "pro":
      return process.env.STRIPE_PRICE_ID_PRO;
    case "agency":
      return process.env.STRIPE_PRICE_ID_AGENCY;
  }
}

export function getPlanFromPriceId(priceId: string | undefined): PlanId | undefined {
  if (!priceId) return undefined;
  if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_AGENCY) return "agency";
  return undefined;
}
