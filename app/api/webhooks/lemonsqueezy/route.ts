import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Lemon Squeezy webhook: verifies the HMAC signature, then notifies the team
 * in Telegram about new (test-mode) subscriptions — same handoff channel the
 * lead pipeline uses.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: true });

  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const valid =
    signature.length === digest.length &&
    crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  if (!valid) return NextResponse.json({ error: "bad signature" }, { status: 401 });

  const event = JSON.parse(raw);
  const name = event?.meta?.event_name as string | undefined;

  if (name === "subscription_created" || name === "order_created") {
    const attrs = event?.data?.attributes ?? {};
    const email = attrs.user_email ?? attrs.customer_email ?? "unknown";
    const product = attrs.product_name ?? attrs.first_order_item?.product_name ?? "LeadPilot";
    const total = attrs.total_formatted ?? "";
    const testMode = attrs.test_mode ? " (test mode)" : "";
    await notifyTelegram(
      `💳 New subscription${testMode}: ${product} ${total}\n👤 ${email}`,
    ).catch(() => {});
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
