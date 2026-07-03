import { Lead } from "./types";

/**
 * Lead store. With SUPABASE_URL + SUPABASE_SECRET_KEY set, leads persist in
 * Postgres (survives serverless instance churn — required on Vercel). Without
 * them it falls back to seeded in-memory data, so local dev needs no config.
 * Seeds are always merged in so the demo dashboard is never empty.
 */
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const DB_ON = Boolean(SUPABASE_URL && SUPABASE_KEY);

const g = globalThis as unknown as { __leads?: Lead[] };

const daysAgo = (d: number, h = 0) =>
  new Date(Date.now() - d * 86400000 - h * 3600000).toISOString();

function seeds(): Lead[] {
  return [
    {
      id: "ld-7f2a",
      name: "Maria Gonzalez",
      contact: "+1 (415) 555-0164",
      service: "Plumbing",
      details: "Water heater is leaking from the bottom, garage is getting flooded.",
      urgency: "emergency",
      score: "hot",
      status: "booked",
      summary: "Leaking water heater flooding the garage — wants someone today.",
      transcript: [
        { role: "assistant", text: "Hi! I can get you booked with our team. What do you need help with?" },
        { role: "user", text: "Plumbing" },
        { role: "assistant", text: "Got it. Briefly, what's going on?" },
        { role: "user", text: "Water heater is leaking from the bottom, garage is getting flooded." },
        { role: "assistant", text: "That sounds urgent. When do you need us?" },
        { role: "user", text: "Emergency — today" },
      ],
      createdAt: daysAgo(0, 3),
    },
    {
      id: "ld-3b91",
      name: "James Carter",
      contact: "james.carter@gmail.com",
      service: "Electrical",
      details: "Half the outlets in the kitchen stopped working after a storm.",
      urgency: "this_week",
      score: "warm",
      status: "contacted",
      summary: "Kitchen outlets dead after a storm — available weekday afternoons.",
      transcript: [
        { role: "assistant", text: "Hi! What do you need help with?" },
        { role: "user", text: "Electrical" },
        { role: "assistant", text: "Briefly, what's going on?" },
        { role: "user", text: "Half the outlets in the kitchen stopped working after a storm." },
      ],
      createdAt: daysAgo(1, 5),
    },
    {
      id: "ld-c04e",
      name: "Emily Park",
      contact: "+1 (206) 555-0139",
      service: "Renovation",
      details: "Planning a bathroom remodel, looking for a quote and rough timeline.",
      urgency: "flexible",
      score: "cold",
      status: "new",
      summary: "Bathroom remodel — early research stage, wants a ballpark quote.",
      transcript: [
        { role: "assistant", text: "Hi! What do you need help with?" },
        { role: "user", text: "Renovation" },
        { role: "user", text: "Planning a bathroom remodel, looking for a quote and rough timeline." },
      ],
      createdAt: daysAgo(2, 1),
    },
    {
      id: "ld-9d17",
      name: "Robert Chen",
      contact: "rchen@outlook.com",
      service: "Cleaning",
      details: "Move-out deep clean for a 3-bedroom house, end of the month.",
      urgency: "this_week",
      score: "warm",
      status: "won",
      summary: "Move-out deep clean, 3BR house — booked for the 28th.",
      transcript: [
        { role: "assistant", text: "Hi! What do you need help with?" },
        { role: "user", text: "Cleaning" },
        { role: "user", text: "Move-out deep clean for a 3-bedroom house, end of the month." },
      ],
      createdAt: daysAgo(4, 2),
    },
    {
      id: "ld-52aa",
      name: "Aisha Thompson",
      contact: "+1 (312) 555-0117",
      service: "Plumbing",
      details: "Kitchen sink drains slowly, tried a plunger, no luck.",
      urgency: "flexible",
      score: "cold",
      status: "lost",
      summary: "Slow kitchen drain — price shopping, went with another provider.",
      transcript: [
        { role: "assistant", text: "Hi! What do you need help with?" },
        { role: "user", text: "Plumbing" },
        { role: "user", text: "Kitchen sink drains slowly, tried a plunger, no luck." },
      ],
      createdAt: daysAgo(6, 4),
    },
  ];
}

function sbHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY as string,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

type Row = {
  id: string;
  name: string;
  contact: string;
  service: string;
  details: string;
  urgency: Lead["urgency"];
  score: Lead["score"];
  status: Lead["status"];
  summary: string;
  transcript: Lead["transcript"];
  created_at: string;
};

const fromRow = (r: Row): Lead => ({
  id: r.id,
  name: r.name,
  contact: r.contact,
  service: r.service,
  details: r.details,
  urgency: r.urgency,
  score: r.score,
  status: r.status,
  summary: r.summary,
  transcript: r.transcript ?? [],
  createdAt: r.created_at,
});

export async function getLeads(): Promise<Lead[]> {
  if (DB_ON) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/leadpilot_leads?select=*&order=created_at.desc&limit=100`,
        { headers: sbHeaders(), cache: "no-store" },
      );
      if (res.ok) {
        const rows = (await res.json()) as Row[];
        return [...rows.map(fromRow), ...seeds()];
      }
    } catch {
      /* fall back to memory below */
    }
  }
  if (!g.__leads) g.__leads = seeds();
  return g.__leads;
}

export async function addLead(lead: Lead): Promise<void> {
  if (DB_ON) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leadpilot_leads`, {
        method: "POST",
        headers: { ...sbHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({
          id: lead.id,
          name: lead.name,
          contact: lead.contact,
          service: lead.service,
          details: lead.details,
          urgency: lead.urgency,
          score: lead.score,
          status: lead.status,
          summary: lead.summary,
          transcript: lead.transcript,
          created_at: lead.createdAt,
        }),
      });
      if (res.ok) return;
    } catch {
      /* fall back to memory below */
    }
  }
  if (!g.__leads) g.__leads = seeds();
  g.__leads.unshift(lead);
}
