import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, ImageOff, MapPin, Package, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { KindBadge, StatusBadge } from "@/components/common/Badges";
import QrCard from "@/components/common/QrCard";
import MatchList from "@/components/item/MatchList";
import { formatDate } from "@/lib/format";

export default function ReportDetail({ report, matches, claimCount, canClaim }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/items/${report.id}`);
  }, [report.id]);

  const isLost = report.kind === "lost";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <Link
        to={isLost ? "/lost" : "/found"}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-fast hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {isLost ? "lost" : "found"} items
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {report.photo_url ? (
              <Image
                src={report.photo_url}
                alt={report.title}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center text-muted-foreground/40">
                <ImageOff className="h-10 w-10" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <KindBadge kind={report.kind} />
            <StatusBadge status={report.status} />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {report.category}
            </span>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {report.title}
          </h1>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/85">
            {report.description}
          </p>

          <dl className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5 shadow-subtle sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {isLost ? "Lost at" : "Found at"}
                </dt>
                <dd className="text-sm font-medium">{report.location}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Date
                </dt>
                <dd className="text-sm font-medium">{formatDate(report.occurred_at)}</dd>
              </div>
            </div>
            {report.holding_location && (
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Kept at
                  </dt>
                  <dd className="text-sm font-medium">{report.holding_location}</dd>
                </div>
              </div>
            )}
          </dl>

          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            The reporter's contact details are private. Campus staff coordinate the handover —{" "}
            {isLost
              ? "open the matching found item and file a claim, or wait for a match."
              : "file a claim if this is yours."}
          </div>
        </div>

        <aside className="space-y-6">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">Suggested matches</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Scored on category, wording, location and date.
            </p>
            <div className="mt-3">
              <MatchList matches={matches} reportId={report.id} />
            </div>
          </div>

          {canClaim && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
              <h2 className="font-heading text-base font-semibold tracking-tight">
                Think this is yours?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                File a claim with proof of ownership — staff review every claim before a handover.
              </p>
              <Link
                to="/items/$reportId/claim"
                params={{ reportId: report.id }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Claim this item
              </Link>
              {claimCount > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {claimCount} {claimCount === 1 ? "claim has" : "claims have"} been filed on this
                  item.
                </p>
              )}
            </div>
          )}

          {shareUrl && (
            <QrCard
              value={shareUrl}
              title="Share this report"
              caption="Scan or print — links straight here"
              filename={`lostlink-${report.id}`}
            />
          )}
        </aside>
      </div>
    </div>
  );
}