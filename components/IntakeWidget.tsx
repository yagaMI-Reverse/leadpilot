"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, Loader2, Send, Sparkles, User } from "lucide-react";
import { TranscriptEntry, URGENCY_LABEL, Urgency } from "@/lib/types";

const SERVICES = ["Plumbing", "Electrical", "Renovation", "Cleaning", "Other"];
const URGENCIES: Urgency[] = ["emergency", "this_week", "flexible"];

/**
 * Step-driven intake: the assistant walks the visitor through a fixed state
 * machine (service → details → urgency → name → contact), so the flow never
 * derails — an LLM can enrich answers server-side, but the structure is code.
 */
type Step = "service" | "details" | "urgency" | "name" | "contact" | "sending" | "done";

type Msg = TranscriptEntry & { id: number };

const PROMPTS: Record<Exclude<Step, "sending" | "done">, string> = {
  service: "Hi! I'm the Harbor Home Services assistant. What do you need help with?",
  details: "Got it. Briefly — what's going on?",
  urgency: "Thanks! When do you need us?",
  name: "Almost done. What's your name?",
  contact: "And the best phone or email to reach you?",
};

let nextId = 1;

export default function IntakeWidget() {
  const [step, setStep] = useState<Step>("service");
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: "assistant", text: PROMPTS.service }]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState({ service: "", details: "", urgency: "" as Urgency | "", name: "", contact: "" });
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, step]);

  const say = (role: "assistant" | "user", text: string) =>
    setMessages((m) => [...m, { id: nextId++, role, text }]);

  const advance = (next: Step) => {
    setStep(next);
    if (next !== "sending" && next !== "done") say("assistant", PROMPTS[next]);
  };

  const pickService = (s: string) => {
    setLead((l) => ({ ...l, service: s }));
    say("user", s);
    advance("details");
  };

  const pickUrgency = (u: Urgency) => {
    setLead((l) => ({ ...l, urgency: u }));
    say("user", URGENCY_LABEL[u]);
    advance("name");
  };

  const submitText = () => {
    const v = input.trim();
    if (!v) return;
    setError(null);

    if (step === "details") {
      setLead((l) => ({ ...l, details: v }));
      say("user", v);
      setInput("");
      advance("urgency");
    } else if (step === "name") {
      if (v.length < 2) return setError("Please enter your name");
      setLead((l) => ({ ...l, name: v }));
      say("user", v);
      setInput("");
      advance("contact");
    } else if (step === "contact") {
      const looksValid = /@.+\./.test(v) || v.replace(/\D/g, "").length >= 7;
      if (!looksValid) return setError("Please enter a valid phone number or email");
      const finalLead = { ...lead, contact: v };
      setLead(finalLead);
      say("user", v);
      setInput("");
      void send(finalLead);
    }
  };

  const send = async (finalLead: typeof lead) => {
    setStep("sending");
    try {
      const transcript: TranscriptEntry[] = [...messages.map(({ role, text }) => ({ role, text })), { role: "user", text: finalLead.contact }];
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalLead, transcript }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
      say("assistant", `Perfect, ${finalLead.name}! You're in the queue — our team will reach out shortly. ${finalLead.urgency === "emergency" ? "Emergency requests are dispatched first." : ""}`);
    } catch {
      setStep("contact");
      setError("Something went wrong — please try again");
    }
  };

  const showTextInput = step === "details" || step === "name" || step === "contact";

  return (
    <div className="card flex h-[480px] w-full max-w-md flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-line bg-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div>
          <div className="text-sm font-semibold">Harbor Home Services</div>
          <div className="flex items-center gap-1.5 text-xs text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" aria-hidden />
            AI assistant · replies instantly
          </div>
        </div>
      </div>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-muted/50 p-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <p
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "rounded-br-md bg-gradient-to-r from-primary to-secondary text-white" : "rounded-bl-md border border-line bg-white text-ink"
                }`}
              >
                {m.text}
              </p>
              {m.role === "user" && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-ink-faint" aria-hidden>
                  <User className="h-4 w-4" />
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {step === "service" && (
          <div className="flex flex-wrap gap-2 pl-9">
            {SERVICES.map((s) => (
              <button key={s} onClick={() => pickService(s)} className="chip">{s}</button>
            ))}
          </div>
        )}
        {step === "urgency" && (
          <div className="flex flex-wrap gap-2 pl-9">
            {URGENCIES.map((u) => (
              <button key={u} onClick={() => pickUrgency(u)} className="chip">{URGENCY_LABEL[u]}</button>
            ))}
          </div>
        )}
        {step === "sending" && (
          <div className="flex items-center gap-2 pl-9 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending to the team…
          </div>
        )}
        {step === "done" && (
          <div className="flex items-center gap-2 pl-9 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" aria-hidden /> Lead delivered — check the dashboard
          </div>
        )}
      </div>

      <div className="border-t border-line bg-white p-3">
        {showTextInput ? (
          <form
            onSubmit={(e) => { e.preventDefault(); submitText(); }}
            className="flex items-center gap-2"
          >
            <label htmlFor="intake-input" className="sr-only">Your answer</label>
            <input
              id="intake-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={step === "details" ? "Describe the problem…" : step === "name" ? "Your name" : "Phone or email"}
              type={step === "contact" ? "text" : "text"}
              inputMode={step === "contact" ? "email" : "text"}
              autoComplete={step === "name" ? "name" : step === "contact" ? "email" : "off"}
              className="input-field"
            />
            <button type="submit" aria-label="Send" className="btn-primary !p-3">
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>
        ) : (
          <p className="py-1 text-center text-xs text-ink-faint">
            {step === "done" ? "Try it again — refresh the page" : "Pick an option above to continue"}
          </p>
        )}
        {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
