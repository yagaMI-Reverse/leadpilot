import { NextResponse } from "next/server";

export const runtime = "nodejs";

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = process.env.LS_STORE_ID;
const VARIANT_ID = process.env.LS_VARIANT_ID;

/**
 * Creates a hosted checkout session (Lemon Squeezy, test mode) and returns its
 * URL — the same session-based pattern as Stripe Checkout. Runs in demo mode
 * (returns {configured:false}) when payment env vars are absent.
 */
export async function POST() {
  if (!API_KEY || !STORE_ID || !VARIANT_ID) {
    return NextResponse.json({ configured: false });
  }

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: { embed: false },
          product_options: {
            redirect_url: "https://leadpilot-umber.vercel.app/?subscribed=1",
          },
        },
        relationships: {
          store: { data: { type: "stores", id: STORE_ID } },
          variant: { data: { type: "variants", id: VARIANT_ID } },
        },
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ configured: true, error: "checkout_failed" }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json({ configured: true, url: data?.data?.attributes?.url ?? null });
}
