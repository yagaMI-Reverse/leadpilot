export type Urgency = "emergency" | "this_week" | "flexible";
export type LeadStatus = "new" | "contacted" | "booked" | "won" | "lost";

export type TranscriptEntry = {
  role: "assistant" | "user";
  text: string;
};

export type Lead = {
  id: string;
  name: string;
  contact: string;
  service: string;
  details: string;
  urgency: Urgency;
  score: "hot" | "warm" | "cold";
  status: LeadStatus;
  summary: string;
  transcript: TranscriptEntry[];
  createdAt: string;
};

export const URGENCY_LABEL: Record<Urgency, string> = {
  emergency: "Emergency — today",
  this_week: "This week",
  flexible: "Flexible / just a quote",
};

export const SCORE_FOR_URGENCY: Record<Urgency, Lead["score"]> = {
  emergency: "hot",
  this_week: "warm",
  flexible: "cold",
};
