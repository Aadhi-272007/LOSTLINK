import { useState } from "react";
import { Loader2, Send, ShieldCheck } from "lucide-react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20";
const labelClass = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export default function ClaimForm({ reportId }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", proof: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    if (form.proof.trim().length < 10) {
      setError("Describe at least a few details that prove the item is yours.");
      return;
    }
    setState("sending");
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          claimant_name: form.name,
          claimant_email: form.email,
          claimant_phone: form.phone || undefined,
          proof: form.proof,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          response.status === 409 || response.status === 404
            ? "This item can no longer be claimed."
            : body.error || "Check your details and try again."
        );
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("We couldn't submit that claim. Check the fields and try again.");
      setState("idle");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-3 font-heading text-base font-semibold">Claim submitted</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Campus staff will review your proof of ownership. If it's approved you'll get a single-use
          return code to collect the item.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <h3 className="font-heading text-base font-semibold tracking-tight">Claim this item</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Only claim what is genuinely yours. False claims are rejected and reported.
      </p>
      <div className="mt-4 grid gap-4">
        <label>
          <span className={labelClass}>Your name</span>
          <input value={form.name} onChange={set("name")} required className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Email</span>
          <input type="email" value={form.email} onChange={set("email")} required className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Phone (optional)</span>
          <input value={form.phone} onChange={set("phone")} className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Proof of ownership</span>
          <textarea
            value={form.proof}
            onChange={set("proof")}
            rows={3}
            required
            placeholder="Serial number, a photo of you with it, what's inside, lock screen details…"
            className={`${inputClass} resize-none`}
          />
        </label>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {state === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        Submit claim
      </button>
    </form>
  );
}