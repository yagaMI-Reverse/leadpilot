import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, isPlanId, isInterval } from "@/lib/stripe";

export const runtime = "nodejs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://leadpilot-umber.vercel.app";

/**
 * Creates a Stripe Checkout Session (subscription mode, test keys) for the
 * requested plan/interval. Prices are defined inline via price_data, so the
 * demo runs off a bare API key with no Dashboard products. Returns
 * {configured:false} when Stripe env vars are absent — the UI then falls back
 * to demo messaging instead of erroring.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ configured: false });

  let plan: unknown, interval: unknown;
  try {
    ({ plan, interval } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!isPlanId(plan) || !isInterval(interval)) {
    return NextResponse.json({ error: "unknown_plan" }, { status: 400 });
  }

  const p = PLANS[plan];
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: interval === "monthly" ? p.monthly : p.yearly,
            recurring: { interval: interval === "monthly" ? "month" : "year" },
            product_data: {
              name: p.name,
              description:
                interval === "yearly" ? "Annual billing — 2 months free" : "Monthly billing",
            },
          },
        },
      ],
      allow_promotion_codes: true,
      success_url: `${SITE}/?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/#pricing`,
      metadata: { plan, interval },
    });
    return NextResponse.json({ configured: true, url: session.url });
  } catch {
    return NextResponse.json({ configured: true, error: "checkout_failed" }, { status: 502 });
  }
}
