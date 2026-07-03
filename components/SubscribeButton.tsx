"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

/**
 * Starts a hosted checkout session (Lemon Squeezy, test mode) — the same
 * session-redirect pattern as Stripe Checkout. Falls back to the demo anchor
 * when payments aren't configured.
 */
export default function SubscribeButton() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const subscribe = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setNote(data?.configured === false ? "Demo build — payments not configured here." : "Checkout failed — try again.");
    } catch {
      setNote("Checkout failed — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={subscribe} disabled={busy} className="btn-primary mt-6 w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CreditCard className="h-4 w-4" aria-hidden />}
        {busy ? "Opening checkout…" : "Subscribe — test mode"}
      </button>
      {note && <p role="status" className="mt-2 text-center text-xs text-ink-faint">{note}</p>}
    </>
  );
}
