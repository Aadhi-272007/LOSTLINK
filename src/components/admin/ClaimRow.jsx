import { useState } from "react";
import { ClaimBadge } from "@/components/common/Badges";
import { formatDateTime } from "@/lib/format";

export default function ClaimRow({ claim, onReview }) {
  const [note, setNote] = useState(claim.review_note ?? "");
  const [code, setCode] = useState(null);
  const [busy, setBusy] = useState(false);

  const decide = async (decision) => {
    setBusy(true);
    try {
      const result = await onReview(claim.id, decision, note);
      if (result?.return_code) setCode(result.return_code);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-subtle">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClaimBadge status={claim.status} />
            <span className="text-xs text-muted-foreground">{claim.report_title}</span>
          </div>
          <p className="mt-2 font-medium">{claim.claimant_name}</p>
          <p className="text-xs text-muted-foreground">
            {claim.claimant_email}
            {claim.claimant_phone ? ` · ${claim.claimant_phone}` : ""}
          </p>
          <p className="mt-2 max-w-xl text-sm text-foreground/85">{claim.proof}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Filed {formatDateTime(claim.created_date)}
          </p>
        </div>
        {claim.status === "approved" && claim.return_code && (
          <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-success">Code</p>
            <p className="font-mono text-sm font-semibold">{claim.return_code}</p>
          </div>
        )}
      </div>

      {code && (
        <p className="mt-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          Approved. Return code <span className="font-mono font-semibold">{code}</span> — share it
          with the claimant. Valid 72 hours.
        </p>
      )}

      {claim.status === "pending" || claim.status === "disputed" ? (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note for the claimant"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide("approved")}
              className="rounded-lg bg-success px-4 py-2 text-xs font-semibold text-success-foreground disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => decide("rejected")}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold transition-fast hover:bg-muted disabled:opacity-60"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => decide("disputed")}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold transition-fast hover:bg-muted disabled:opacity-60"
            >
              Dispute
            </button>
          </div>
        </div>
      ) : (
        claim.review_note && (
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Note: {claim.review_note}
          </p>
        )
      )}
    </div>
  );
}