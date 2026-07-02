import Link from "next/link";
import {
  ArrowRight, BellRing, BotMessageSquare, CalendarCheck, Check, Filter,
  LayoutDashboard, MessageSquareText, Send, ShieldCheck, Zap,
} from "lucide-react";
import IntakeWidget from "@/components/IntakeWidget";

export default function Landing() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-surface/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-xl text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <Send className="h-4 w-4" aria-hidden />
            </span>
            LeadPilot
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-dim sm:flex" aria-label="Main">
            <a href="#how" className="transition-colors hover:text-primary">How it works</a>
            <a href="#features" className="transition-colors hover:text-primary">Features</a>
            <a href="#pricing" className="transition-colors hover:text-primary">Pricing</a>
          </nav>
          <Link href="/dashboard" className="btn-ghost !px-4 !py-2">
            <LayoutDashboard className="h-4 w-4" aria-hidden /> Live dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" aria-hidden />
            For service businesses that live on inbound leads
          </p>
          <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-[3.4rem]">
            Never lose another <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">inquiry</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-dim">
            LeadPilot greets every visitor, collects what your team actually needs, scores the lead,
            and delivers it to your inbox, Telegram or CRM — 24/7, in under a minute.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#demo" className="btn-primary">Try the live demo <ArrowRight className="h-4 w-4" aria-hidden /></a>
            <Link href="/dashboard" className="btn-ghost">See collected leads</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-dim">
            {["No forms, no friction", "Qualifies & scores every lead", "Hands off to a human instantly"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div id="demo" className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 blur-2xl" aria-hidden />
            <div className="relative animate-fade-up">
              <IntakeWidget />
              <p className="mt-3 text-center text-xs text-ink-faint">
                ↑ This is the real product — finish the chat and your lead appears on the <Link href="/dashboard" className="font-medium text-primary underline">dashboard</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-line bg-white py-16">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl">From visitor to booked job in 4 steps</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MessageSquareText, title: "Greets instantly", text: "The assistant opens the conversation the moment a visitor lands — no forms to find, no phone tag." },
              { icon: Filter, title: "Qualifies & scores", text: "A guided flow collects service, details and urgency, then scores the lead hot / warm / cold." },
              { icon: BellRing, title: "Alerts your team", text: "Hot leads hit your Telegram, email or CRM with a one-line AI summary — while the visitor is still on the page." },
              { icon: CalendarCheck, title: "Books the follow-up", text: "Your team calls back with full context: what, when, and how urgent. No cold intros." },
            ].map((s, i) => (
              <div key={s.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="mt-4 text-xs font-semibold text-ink-faint">STEP {i + 1}</div>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="container-page py-16">
        <h2 className="text-center font-display text-3xl">Built like a teammate, not a popup</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="card p-7 lg:col-span-2">
            <BotMessageSquare className="h-6 w-6 text-primary" aria-hidden />
            <h3 className="mt-3 text-xl font-semibold">Structured AI intake — never derails</h3>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-dim">
              The conversation runs on an explicit state machine: the assistant always knows what it has
              collected and what's missing. The LLM enriches summaries and language — it never free-runs,
              never promises your prices, never invents availability.
            </p>
          </div>
          <div className="card p-7">
            <Zap className="h-6 w-6 text-accent" aria-hidden />
            <h3 className="mt-3 text-xl font-semibold">Hot-lead routing</h3>
            <p className="mt-2 leading-relaxed text-ink-dim">Emergencies jump the queue and ping your team instantly with full context.</p>
          </div>
          <div className="card p-7">
            <LayoutDashboard className="h-6 w-6 text-secondary" aria-hidden />
            <h3 className="mt-3 text-xl font-semibold">Lead dashboard</h3>
            <p className="mt-2 leading-relaxed text-ink-dim">Every conversation, transcript, status and outcome — in one place your whole team can read.</p>
          </div>
          <div className="card p-7 lg:col-span-2">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
            <h3 className="mt-3 text-xl font-semibold">Guardrails by design</h3>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-dim">
              The assistant collects information — it doesn't negotiate, quote prices, or give professional
              advice. Anything unusual gets flagged for a human. Your reputation stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-line bg-white py-16">
        <div className="container-page">
          <h2 className="text-center font-display text-3xl">Simple pricing</h2>
          <p className="mt-2 text-center text-ink-dim">Pays for itself with one recovered job.</p>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {[
              { name: "Starter", price: "$49", tag: "per month", items: ["AI intake on your site", "Email lead delivery", "Lead dashboard", "100 conversations/mo"] },
              { name: "Growth", price: "$99", tag: "per month", featured: true, items: ["Everything in Starter", "Telegram + CRM handoff", "Hot-lead routing", "AI summaries", "Unlimited conversations"] },
              { name: "Custom", price: "Let's talk", tag: "for multi-location", items: ["Multiple businesses", "Custom intake flows", "Calendar booking", "Priority support"] },
            ].map((p) => (
              <div key={p.name} className={`card relative p-7 ${p.featured ? "border-primary shadow-lift" : ""}`}>
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-semibold">{p.name}</h3>
                <div className="mt-2 font-display text-3xl">{p.price}</div>
                <div className="text-xs text-ink-faint">{p.tag}</div>
                <ul className="mt-5 space-y-2.5 text-sm text-ink-dim">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {it}
                    </li>
                  ))}
                </ul>
                <a href="#demo" className={`mt-6 w-full ${p.featured ? "btn-primary" : "btn-ghost"}`}>Start with the demo</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container-page flex flex-col items-center justify-between gap-3 py-10 text-sm text-ink-faint sm:flex-row">
        <span className="flex items-center gap-2 font-display text-ink">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white">
            <Send className="h-3 w-3" aria-hidden />
          </span>
          LeadPilot
        </span>
        <span>Portfolio project · Next.js 14 + TypeScript · The demo business is fictional</span>
      </footer>
    </main>
  );
}
