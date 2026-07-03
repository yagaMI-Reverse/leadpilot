"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { Loader2, Mic, PhoneCall, PhoneOff } from "lucide-react";

// Both values are public by design: the key is Vapi's client-side key and the
// assistant id only lets visitors talk to our receptionist.
const VAPI_PUBLIC_KEY = "afa31dbf-d5c9-489b-a590-286367626ca3";
const ASSISTANT_ID = "65fd3638-225e-4845-b355-94dba8e4e05b";

type CallState = "idle" | "connecting" | "active" | "ended";

/**
 * Browser voice call to the Harbor Home Services intake agent (Vapi).
 * After the call ends, Vapi's end-of-call webhook turns the conversation
 * into a scored lead — same pipeline as the chat widget.
 */
export default function VoiceCallButton() {
  const vapiRef = useRef<Vapi | null>(null);
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;
    vapi.on("call-start", () => setState("active"));
    vapi.on("call-end", () => setState("ended"));
    vapi.on("error", () => {
      setError("Voice call failed — check mic permissions and try again.");
      setState("idle");
    });
    return () => {
      vapi.stop();
    };
  }, []);

  const toggle = async () => {
    setError(null);
    const vapi = vapiRef.current;
    if (!vapi) return;
    if (state === "active") {
      vapi.stop();
      return;
    }
    setState("connecting");
    try {
      await vapi.start(ASSISTANT_ID);
    } catch {
      setError("Could not start the call — allow microphone access and retry.");
      setState("idle");
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={toggle}
        disabled={state === "connecting"}
        className={state === "active" ? "btn-ghost !border-red-300 !text-red-600" : "btn-ghost"}
        aria-label={state === "active" ? "End voice call" : "Start voice call with the AI assistant"}
      >
        {state === "connecting" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {state === "active" && <PhoneOff className="h-4 w-4" aria-hidden />}
        {(state === "idle" || state === "ended") && <PhoneCall className="h-4 w-4" aria-hidden />}
        {state === "connecting" ? "Connecting…" : state === "active" ? "End call" : "Talk to our AI"}
      </button>
      {state === "active" && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Mic className="h-3 w-3 animate-pulse" aria-hidden /> Live — speak now
        </span>
      )}
      {state === "ended" && (
        <span className="text-xs text-ink-faint">Call finished — your request is on the dashboard shortly</span>
      )}
      {error && <span role="alert" className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
