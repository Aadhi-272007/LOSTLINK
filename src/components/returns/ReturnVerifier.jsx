import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

const messages = {
  invalid: "That code doesn't belong to any return. Check it with the claimant.",
  notApproved: "That return code belongs to a claim that hasn't been approved.",
  alreadyUsed: "This code was already used — the item has been handed over once.",
  expired: "This code expired. Approve the claim again to issue a fresh one.",
};

export default function ReturnVerifier() {
  const [code, setCode] = useState("");
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setState("checking");
    setResult(null);
    try {
      const response = await apiFetch("/api/returns", { method: "POST", body: { code } });
      setResult(response);
      setState(response.ok ? "ok" : "failed");
    } catch {
      setResult({ ok: false, error: "invalid" });
      setState("failed");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="RV-XXXXXX"
          aria-label="Return code"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm uppercase tracking-wider outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          disabled={state === "checking" || code.trim().length < 4}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
        >
          {state === "checking" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          )}
          Verify
        </button>
      </form>

      {result?.ok && (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
          <p className="inline-flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Return confirmed
          </p>
          <p className="mt-1 text-sm text-foreground">
            {result.report_title} handed to {result.claimant_name}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Marked returned {formatDateTime(result.returned_at)}. The code is now used up.
          </p>
        </div>
      )}

      {result && !result.ok && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="inline-flex items-center gap-2 font-semibold text-destructive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Code not accepted
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages[result.error] ?? "Please try again."}
          </p>
        </div>
      )}
    </div>
  );
}