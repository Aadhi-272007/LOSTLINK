import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, ShieldCheck } from "lucide-react";
import QrCard from "@/components/common/QrCard";

export default function ReportSuccess({ result }) {
  const [copied, setCopied] = useState(false);
  const itemUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/items/${result.id}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.management_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 shadow-floating sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Your {result.kind} report is live
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          “{result.title}” is now on the board and being matched against the other side. Save the
          code below — it is the only way to edit or withdraw this report.
        </p>

        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Management code
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="font-mono text-xl font-semibold tracking-wider text-foreground">
              {result.management_code}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-fast hover:bg-muted"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stored in this browser too, under “My reports”. Keep a copy somewhere safe.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <Link
              to="/items/$reportId"
              params={{ reportId: result.id }}
              className="block rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5"
            >
              Open my report
            </Link>
            <Link
              to="/my-reports"
              className="block rounded-lg border border-border bg-card px-5 py-3 text-center text-sm font-semibold transition-fast hover:bg-muted"
            >
              Manage my reports
            </Link>
            <Link
              to="/report"
              className="block rounded-lg px-5 py-3 text-center text-sm font-semibold text-primary transition-fast hover:bg-primary/5"
            >
              Report another item
            </Link>
            <p className="pt-2 text-xs text-muted-foreground">
              Print this QR code and attach it to the item — anyone who scans it lands straight on
              this report.
            </p>
          </div>
          {itemUrl && (
            <QrCard
              value={itemUrl}
              title={result.title}
              caption="Scan to open this report"
              filename={`lostlink-${result.id}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}