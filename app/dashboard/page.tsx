"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bot, Flame, Inbox, RefreshCw, Send, Snowflake, Sun, User, X,
} from "lucide-react";
import { Lead, URGENCY_LABEL } from "@/lib/types";

const SCORE_UI = {
  hot: { label: "Hot", icon: Flame, cls: "bg-red-50 text-red-600 border-red-200" },
  warm: { label: "Warm", icon: Sun, cls: "bg-amber-50 text-amber-600 border-amber-200" },
  cold: { label: "Cold", icon: Snowflake, cls: "bg-sky-50 text-sky-600 border-sky-200" },
} as const;

const STATUS_CLS: Record<Lead["status"], string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-secondary/10 text-secondary",
  booked: "bg-emerald-50 text-emerald-600",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-slate-100 text-slate-500",
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = () =>
    fetch("/api/leads").then((r) => r.json()).then(setLeads).catch(() => setLeads([]));
  useEffect(() => { void load(); }, []);

  const kpi = useMemo(() => {
    const l = leads ?? [];
    return {
      total: l.length,
      hot: l.filter((x) => x.score === "hot").length,
      booked: l.filter((x) => x.status === "booked" || x.status === "won").length,
      recovered: l.filter((x) => x.status === "won").length * 450, // demo assumption: $450 avg job
    };
  }, [leads]);

  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-surface/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-xl text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <Send className="h-4 w-4" aria-hidden />
            </span>
            LeadPilot
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-faint sm:block">
              Demo dashboard · public
            </span>
            <Link href="/" className="btn-ghost !px-4 !py-2">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to site
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Leads</h1>
          <button onClick={load} className="btn-ghost !px-3 !py-2" aria-label="Refresh leads">
            <RefreshCw className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total leads", value: kpi.total },
            { label: "Hot right now", value: kpi.hot },
            { label: "Booked / won", value: kpi.booked },
            { label: "Est. recovered revenue", value: `$${kpi.recovered.toLocaleString()}` },
          ].map((k) => (
            <div key={k.label} className="card p-5">
              <div className="font-display text-2xl">{k.value}</div>
              <div className="mt-0.5 text-xs text-ink-faint">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3.5 font-semibold">Lead</th>
                <th className="px-5 py-3.5 font-semibold">Service</th>
                <th className="px-5 py-3.5 font-semibold">Urgency</th>
                <th className="px-5 py-3.5 font-semibold">Score</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {leads === null && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-faint">Loading…</td></tr>
              )}
              {leads?.map((l) => {
                const S = SCORE_UI[l.score];
                return (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-muted/60"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-ink-faint">{l.contact}</div>
                    </td>
                    <td className="px-5 py-4">{l.service}</td>
                    <td className="px-5 py-4 text-ink-dim">{URGENCY_LABEL[l.urgency]}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${S.cls}`}>
                        <S.icon className="h-3 w-3" aria-hidden /> {S.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_CLS[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="max-w-[260px] truncate px-5 py-4 text-ink-dim">{l.summary}</td>
                  </tr>
                );
              })}
              {leads?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-faint">
                    <Inbox className="mx-auto mb-2 h-6 w-6" aria-hidden />
                    No leads yet — try the assistant on the home page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">Click a lead to see the full conversation transcript.</p>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              aria-label="Close details"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 cursor-default bg-ink/40"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-white shadow-lift"
              role="dialog" aria-label={`Lead details: ${selected.name}`}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="text-xs text-ink-faint">{selected.contact} · {new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-muted hover:text-ink">
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="border-b border-line bg-muted/50 px-5 py-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">AI summary</div>
                <p className="mt-1 leading-relaxed text-ink">{selected.summary}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {selected.transcript.map((t, i) => (
                  <div key={i} className={`flex items-end gap-2 ${t.role === "user" ? "justify-end" : ""}`}>
                    {t.role === "assistant" && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <p className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${t.role === "user" ? "bg-gradient-to-r from-primary to-secondary text-white" : "border border-line bg-white"}`}>
                      {t.text}
                    </p>
                    {t.role === "user" && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-ink-faint" aria-hidden>
                        <User className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
