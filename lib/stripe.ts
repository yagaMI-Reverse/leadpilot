import Stripe from "stripe";

/**
 * Lazily-constructed Stripe client. LeadPilot ships as a public demo, so all
 * payment routes degrade gracefully (configured:false) when the secret key is
 * absent instead of crashing at import time.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

/** Subscription tiers — prices are created inline via price_data, so the
 *  demo needs zero Dashboard setup beyond an API key. Amounts in cents. */
export const PLANS = {
  starter: {
    name: "LeadPilot Starter",
    monthly: 4900,
    yearly: 47000, // ~20% off (12×49=588 → 470)
  },
  growth: {
    name: "LeadPilot Growth",
    monthly: 9900,
    yearly: 95000, // ~20% off (12×99=1188 → 950)
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Interval = "monthly" | "yearly";

export function isPlanId(v: unknown): v is PlanId {
  return v === "starter" || v === "growth";
}
export function isInterval(v: unknown): v is Interval {
  return v === "monthly" || v === "yearly";
}
