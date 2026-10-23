import { ClaimStatus, ReportKind, ReportStatus } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { QrCard } from "@/components/common/QrCard";
import {
  ClaimStatusBadge,
  ReportKindBadge,
  ReportStatusBadge,
} from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useClaimsForReport,
  useFileClaim,
  useMatchesForReport,
  useReport,
} from "@/hooks/use-backend";
import { formatDate, formatDateTime, formatScore } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ImageOff,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function MatchRow({
  score,
  explanation,
  otherTitle,
  otherId,
}: {
  score: bigint;
  explanation: string;
  otherTitle: string;
  otherId: bigint;
}) {
  const value = Number(score);
  const tone =
    value >= 75
      ? "var(--confidence-high)"
      : value >= 50
        ? "var(--confidence-mid)"
        : "var(--confidence-low)";
  return (
    <Link
      to="/matches/$matchId"
      params={{ matchId: otherId.toString() }}
      data-ocid="detail.match_link"
      className="block rounded-lg border border-border bg-card p-4 transition-smooth hover:border-primary/30 hover:shadow-subtle"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-foreground">
          {otherTitle}
        </p>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: `oklch(${tone})` }}
        >
          {formatScore(score)}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: `oklch(${tone})` }}
        />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
        {explanation}
      </p>
    </Link>
  );
}

export function ItemDetailPage() {
  const { reportId } = useParams({ strict: false }) as { reportId: string };
  const id = reportId ? BigInt(reportId) : undefined;

  const { data: report, isLoading, isError } = useReport(id);
  const { data: matches } = useMatchesForReport(id);
  const { data: claims } = useClaimsForReport(id);
  const fileClaim = useFileClaim();

  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [proof, setProof] = useState("");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          data-ocid="error_state"
          title="Report not found"
          description="This report may have been withdrawn or removed. Browse the board to find other items."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/lost">Browse lost items</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const detailUrl = `${window.location.origin}/items/${report.id.toString()}`;
  const isFound = report.kind === ReportKind.found;
  const canClaim = isFound && report.status === ReportStatus.active;

  const handleClaim = (event: React.FormEvent) => {
    event.preventDefault();
    if (!claimantName.trim() || !claimantEmail.trim() || !proof.trim()) {
      toast.error("Please complete your name, email, and proof of ownership.");
      return;
    }
    fileClaim.mutate(
      {
        reportId: report.id,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim(),
        claimantPhone: claimantPhone.trim() || undefined,
        proof: proof.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Claim submitted. Staff will review it shortly.");
          setClaimantName("");
          setClaimantEmail("");
          setClaimantPhone("");
          setProof("");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "We couldn't submit your claim.",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 rounded-lg text-muted-foreground"
      >
        <Link to={isFound ? "/found" : "/lost"} data-ocid="detail.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {isFound ? "found" : "lost"} items
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-8">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {report.photo ? (
              <img
                src={report.photo}
                alt={report.title}
                className="max-h-[460px] w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center text-muted-foreground">
                <ImageOff className="size-10" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ReportKindBadge kind={report.kind} />
              <ReportStatusBadge status={report.status} />
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {report.category}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {report.title}
            </h1>
            <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {report.description}
            </p>
          </div>

          <dl className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-subtle sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                {isFound ? "Found at" : "Last seen at"}
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {report.location}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <CalendarDays
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                {isFound ? "Date found" : "Date lost"}
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDate(report.occurredAt)}
              </dd>
            </div>
            {report.holdingLocation ? (
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <PackageCheck
                    className="size-3.5 text-primary"
                    aria-hidden="true"
                  />
                  Currently held at
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {report.holdingLocation}
                </dd>
              </div>
            ) : null}
            <div className="space-y-1">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Reported
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDateTime(report.createdAt)}
              </dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Contact details for this report are private. They are only shared
            with the person whose claim is approved.
          </p>

          {/* Matches */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Match suggestions
              </h2>
            </div>
            {(matches?.length ?? 0) === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
                No matches yet. New reports are compared automatically, so check
                back after more items are posted.
              </p>
            ) : (
              <div className="space-y-3">
                {matches?.map((match) => {
                  const other =
                    match.lost.id === report.id ? match.found : match.lost;
                  return (
                    <MatchRow
                      key={match.id.toString()}
                      score={match.score}
                      explanation={match.explanation}
                      otherTitle={other.title}
                      otherId={match.id}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Claims */}
          {isFound ? (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Claims on this item
              </h2>
              {(claims?.length ?? 0) === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
                  No claims have been filed yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {claims?.map((claim) => (
                    <li
                      key={claim.id.toString()}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {claim.claimantName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Filed {formatDateTime(claim.createdAt)}
                        </p>
                      </div>
                      <ClaimStatusBadge status={claim.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <QrCard
            value={detailUrl}
            title={report.title}
            caption="Scan to open this report"
            filename={`lostlink-report-${report.id.toString()}`}
          />

          {canClaim ? (
            <Card className="rounded-xl border-border shadow-subtle">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Claim this item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClaim} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claim-name">Your name</Label>
                    <Input
                      id="claim-name"
                      data-ocid="claim.name_input"
                      value={claimantName}
                      onChange={(event) => setClaimantName(event.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claim-email">Email</Label>
                    <Input
                      id="claim-email"
                      type="email"
                      data-ocid="claim.email_input"
                      value={claimantEmail}
                      onChange={(event) => setClaimantEmail(event.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claim-phone">Phone (optional)</Label>
                    <Input
                      id="claim-phone"
                      data-ocid="claim.phone_input"
                      value={claimantPhone}
                      onChange={(event) => setClaimantPhone(event.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claim-proof">Proof of ownership</Label>
                    <Textarea
                      id="claim-proof"
                      data-ocid="claim.proof_textarea"
                      value={proof}
                      onChange={(event) => setProof(event.target.value)}
                      placeholder="Describe a detail only the owner would know — a scratch, a sticker, a serial number."
                      className="min-h-24 rounded-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-ocid="claim.submit_button"
                    className="w-full rounded-lg shadow-elevated"
                    disabled={fileClaim.isPending}
                  >
                    {fileClaim.isPending ? "Submitting…" : "Submit claim"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : isFound ? (
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              This item is no longer open for claims.
            </p>
          ) : (
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Found this item? Post a found report so matching can connect it to
              the owner.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
