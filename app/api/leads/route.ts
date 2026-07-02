import { NextRequest, NextResponse } from "next/server";
import { addLead, getLeads } from "@/lib/store";
import { Lead, SCORE_FOR_URGENCY, TranscriptEntry, Urgency } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getLeads());
}

type CreateBody = {
  name: string;
  contact: string;
  service: string;
  details: string;
  urgency: Urgency;
  transcript: TranscriptEntry[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateBody;
  if (!body?.name?.trim() || !body?.contact?.trim() || !body?.service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const lead: Lead = {
    id: `ld-${Math.random().toString(16).slice(2, 6)}`,
    name: body.name.trim().slice(0, 80),
    contact: body.contact.trim().slice(0, 120),
    service: body.service,
    details: body.details?.trim().slice(0, 600) || "",
    urgency: body.urgency,
    score: SCORE_FOR_URGENCY[body.urgency] ?? "warm",
    status: "new",
    summary: await summarize(body),
    transcript: (body.transcript || []).slice(0, 40),
    createdAt: new Date().toISOString(),
  };

  addLead(lead);
  notifyTelegram(lead).catch(() => {}); // fire-and-forget; never blocks the reply
  return NextResponse.json(lead, { status: 201 });
}

/** Internal one-line summary for the team. Uses OpenAI when a key is set; falls back to a rule-based summary so the demo runs free. */
async function summarize(b: CreateBody): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "user",
              content: `Summarize this service inquiry for the team in one short sentence (max 18 words). Service: ${b.service}. Urgency: ${b.urgency}. Details: ${b.details}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch {
      /* fall through to rule-based */
    }
  }
  const urgencyNote =
    b.urgency === "emergency" ? "needs help today" : b.urgency === "this_week" ? "this week" : "flexible timing";
  return `${b.service}: ${b.details.slice(0, 90) || "no details given"} (${urgencyNote})`;
}

/** Optional Telegram handoff — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars. */
async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const text = [
    `🔥 New ${lead.score.toUpperCase()} lead — ${lead.service}`,
    `👤 ${lead.name} · ${lead.contact}`,
    `📝 ${lead.summary}`,
  ].join("\n");
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}
