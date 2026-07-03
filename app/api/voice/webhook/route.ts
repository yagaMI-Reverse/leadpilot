import { NextRequest, NextResponse } from "next/server";
import { addLead } from "@/lib/store";
import { notifyTelegram } from "@/lib/notify";
import { Lead, SCORE_FOR_URGENCY, TranscriptEntry, Urgency } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Vapi end-of-call webhook: turns a finished voice call into a scored lead —
 * the same pipeline the chat widget feeds. Secured by the x-vapi-secret header.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-vapi-secret") !== secret) {
    return NextResponse.json({ error: "bad secret" }, { status: 401 });
  }

  const body = await req.json();
  const message = body?.message;
  if (message?.type !== "end-of-call-report") {
    return NextResponse.json({ ok: true });
  }

  const data = (message?.analysis?.structuredData ?? {}) as {
    service?: string;
    details?: string;
    urgency?: Urgency;
    name?: string;
    contact?: string;
  };
  const summary: string = message?.analysis?.summary ?? "";

  // A call with no captured contact isn't a lead — log nothing, never guess.
  if (!data.name && !data.contact) {
    return NextResponse.json({ ok: true, skipped: "no contact captured" });
  }

  const transcript: TranscriptEntry[] = (message?.artifact?.messages ?? [])
    .filter((m: { role?: string }) => m.role === "bot" || m.role === "user")
    .map((m: { role: string; message?: string; content?: string }) => ({
      role: m.role === "bot" ? ("assistant" as const) : ("user" as const),
      text: m.message ?? m.content ?? "",
    }))
    .filter((t: TranscriptEntry) => t.text)
    .slice(0, 60);

  const urgency: Urgency = (["emergency", "this_week", "flexible"] as const).includes(
    data.urgency as Urgency,
  )
    ? (data.urgency as Urgency)
    : "this_week";

  const lead: Lead = {
    id: `ld-${Math.random().toString(16).slice(2, 6)}`,
    name: (data.name ?? "Voice caller").slice(0, 80),
    contact: (data.contact ?? "not captured").slice(0, 120),
    service: (data.service ?? "Other").slice(0, 40),
    details: (data.details ?? "").slice(0, 600),
    urgency,
    score: SCORE_FOR_URGENCY[urgency],
    status: "new",
    summary: `📞 Voice call: ${summary || data.details || "see transcript"}`.slice(0, 300),
    transcript,
    createdAt: new Date().toISOString(),
  };

  await addLead(lead);
  await notifyTelegram(
    [
      `📞 New ${lead.score.toUpperCase()} lead from a VOICE call — ${lead.service}`,
      `👤 ${lead.name} · ${lead.contact}`,
      `📝 ${lead.summary}`,
    ].join("\n"),
  ).catch(() => {});

  return NextResponse.json({ ok: true, leadId: lead.id });
}
