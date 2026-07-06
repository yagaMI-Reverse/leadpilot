import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook endpoint.
 *
 * Reliability pattern: (1) verify the signature against the RAW body — never
 * a parsed/re-serialized one; (2) deduplicate by event.id so Stripe's
 * at-least-once delivery can't double-process a payment; (3) acknowledge 2xx
 * fast and keep side effects fire-and-forget.
 *
 * The dedupe store here is in-memory (per serverless instance) because this
 * demo has no database — in a production system the same guard is a unique
 * key on a processed_events table (insert-or-skip in the same transaction as
 * the side effect).
 */
const processed = new Set<string>();
const PROCESSED_CAP = 1000;

function markProcessed(id: string): boolean {
  if (processed.has(id)) return false;
  processed.add(id);
  if (processed.size > PROCESSED_CAP) {
    const first = processed.values().next().value;
    if (first) processed.delete(first);
  }
  return true;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ ok: true });

  const raw = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  // Idempotency: Stripe retries until it sees 2xx, so replays are expected.
  if (!markProcessed(event.id)) return NextResponse.json({ ok: true, deduped: true });

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const email = s.customer_details?.email ?? "unknown";
      const plan = s.metadata?.plan ?? "growth";
      const interval = s.metadata?.interval ?? "monthly";
      const total = ((s.amount_total ?? 0) / 100).toFixed(2);
      await notifyTelegram(
        `💳 Stripe subscription (test mode): ${plan}/${interval} — $${total}\n👤 ${email}`,
      ).catch(() => {});
      break;
    }
    case "invoice.paid":
    case "customer.subscription.deleted":
      // Renewals & cancellations would sync a subscriptions table here.
      break;
  }

  return NextResponse.json({ ok: true });
}

async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}
