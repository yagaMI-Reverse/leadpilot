import { Lead } from "./types";

/**
 * Demo store: in-memory with seeded sample leads so the dashboard is alive
 * on first load. In production swap for Postgres/Supabase — the API surface
 * (list/create/update) stays identical.
 */
const g = globalThis as unknown as { __leads?: Lead[] };

const daysAgo = (d: number, h = 0) =>
  new Date(Date.now() - d * 86400000 - h * 3600000).toISOString();

function seed(): Lead[] {
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

export function getLeads(): Lead[] {
  if (!g.__leads) g.__leads = seed();
  return g.__leads;
}

export function addLead(lead: Lead): void {
  getLeads().unshift(lead);
}
