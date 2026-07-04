import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary diagnostic: reports which env vars are present (never their values).
export async function GET() {
  const has = (k: string) => Boolean(process.env[k]);
  return NextResponse.json({
    VAPI_WEBHOOK_SECRET: has("VAPI_WEBHOOK_SECRET"),
    SUPABASE_URL: has("SUPABASE_URL"),
    SUPABASE_SECRET_KEY: has("SUPABASE_SECRET_KEY"),
    TELEGRAM_BOT_TOKEN: has("TELEGRAM_BOT_TOKEN"),
    LEMONSQUEEZY_API_KEY: has("LEMONSQUEEZY_API_KEY"),
  });
}
