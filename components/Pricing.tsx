"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";

type Interval = "monthly" | "yearly";

const TIERS = [
  {
    id: "starter" as const,
    name: "Starter",
    monthly: 49,
    yearly: 470,
    blurb: "For a single business getting started.",
    items: ["AI intake on your site", "Email lead delivery", "Lead dashboard", "100 conversations/mo"],
  },
  {
    id: "growth" as const,
    name: "Growth",
    monthly: 99,
    yearly: 950,
    featured: true,
    blurb: "For teams that live on their leads.",
    items: ["Everything in Starter", "Telegram + CRM handoff", "Hot-lead routing", "AI summaries", "Unlimited conversations"],
  },
  {
    id: "custom" as const,
    name: "Custom",
    monthly: null,
    yearly: null,
    blurb: "For multi-location operations.",
    items: ["Multiple businesses", "Custom intake flows", "Calendar booking", "Priority support"],
  },
];

export default function Pricing() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const checkout = async (plan: "starter" | "growth") => {
    setBusy(plan);
    setNote(null);
    try {
      // Stripe first; if this deployment has no Stripe keys, fall back to the
      // legacy Lemon Squeezy session so the demo always has a live path.
      let res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      let data = await res.json();
      if (data?.configured === false) {
        res = await fetch("/api/checkout", { method: "POST" });
        data = await res.json();
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setNote(
        data?.configured === false
          ? "Demo build — payments not configured here."
          : "Checkout failed — try again.",
      );
    } catch {
      setNote("Checkout failed — try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-line bg-white py-16">
      {/* ambient liquid blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container-page relative">
        <h2 className="text-center font-display text-3xl">Simple pricing</h2>
        <p className="mt-2 text-center text-ink-dim">Pays for itself with one recovered job.</p>

        {/* interval toggle */}
        <div className="mt-8 flex justify-center">
          <div
            role="tablist"
            aria-label="Billing interval"
            className="relative flex rounded-full border border-line bg-muted p-1 shadow-soft"
          >
            {(["monthly", "yearly"] as const).map((iv) => (
              <button
                key={iv}
                role="tab"
                aria-selected={interval === iv}
                onClick={() => setInterval(iv)}
                className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                  interval === iv ? "text-white" : "text-ink-dim hover:text-ink"
                }`}
              >
                {interval === iv && (
                  <motion.span
                    layoutId="interval-pill"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary to-accent shadow-lift"
                  />
                )}
                {iv === "monthly" ? "Monthly" : (
                  <span className="flex items-center gap-1.5">
                    Yearly
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${interval === iv ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                      2 mo free
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* cards */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className={`relative rounded-2xl p-[1.5px] ${
                t.featured
                  ? "bg-gradient-to-b from-primary via-accent to-primary shadow-lift"
                  : "bg-line"
              }`}
            >
              <div className="relative h-full rounded-[calc(1rem-1px)] bg-white/90 p-7 backdrop-blur-xl">
                {t.featured && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-white shadow-soft">
                    <Sparkles className="h-3 w-3" aria-hidden /> Most popular
                  </span>
                )}
                <h3 className="font-semibold">{t.name}</h3>
                <div className="mt-2 flex h-12 items-baseline gap-1.5 overflow-hidden">
                  {t.monthly === null ? (
                    <span className="font-display text-3xl">Let&apos;s talk</span>
                  ) : (
                    <>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={interval}
                          initial={reduceMotion ? false : { y: 18, opacity: 0, filter: "blur(4px)" }}
                          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                          exit={reduceMotion ? undefined : { y: -18, opacity: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className="font-display text-3xl tabular-nums"
                        >
                          ${interval === "monthly" ? t.monthly : t.yearly}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-xs text-ink-faint">/{interval === "monthly" ? "mo" : "yr"}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-faint">{t.blurb}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-ink-dim">
                  {t.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {it}
                    </li>
                  ))}
                </ul>

                {t.id === "custom" ? (
                  <a href="#demo" className="btn-ghost mt-6 w-full">Start with the demo</a>
                ) : (
                  <button
                    onClick={() => checkout(t.id)}
                    disabled={busy !== null}
                    className={`${t.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full`}
                  >
                    {busy === t.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <CreditCard className="h-4 w-4" aria-hidden />
                    )}
                    {busy === t.id ? "Opening checkout…" : `Subscribe ${interval === "yearly" ? "yearly" : "monthly"}`}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {note && (
          <p role="status" className="mt-4 text-center text-xs text-ink-faint">{note}</p>
        )}
        <p className="mt-6 text-center text-xs text-ink-faint">
          Checkout runs on Stripe in <strong>test mode</strong> — try card 4242 4242 4242 4242, any future date, any CVC. No real charges.
        </p>
      </div>
    </section>
  );
}
