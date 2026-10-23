import type { ReportView } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import {
  ReportKindBadge,
  ReportStatusBadge,
} from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatch } from "@/hooks/use-backend";
import { formatDate, formatScore } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ImageOff,
  MapPin,
  Sparkles,
} from "lucide-react";

function ReportColumn({
  report,
  label,
}: { report: ReportView; label: string }) {
  return (
    <Card className="rounded-xl border-border shadow-subtle">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <ReportKindBadge kind={report.kind} />
        </div>
        <CardTitle className="font-display text-lg">{report.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          {report.photo ? (
            <img
              src={report.photo}
              alt={report.title}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="flex h-44 items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{report.description}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <dt className="sr-only">Location</dt>
            <dd className="text-foreground">{report.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <dt className="sr-only">Date</dt>
            <dd className="text-foreground">{formatDate(report.occurredAt)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {report.category}
          </span>
          <ReportStatusBadge status={report.status} />
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full rounded-lg bg-card"
        >
          <Link
            to="/items/$reportId"
            params={{ reportId: report.id.toString() }}
            data-ocid="match_detail.report_link"
          >
            Open full report
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function MatchDetailPage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };
  const id = matchId ? BigInt(matchId) : undefined;
  const { data: match, isLoading, isError } = useMatch(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          data-ocid="error_state"
          title="Match not found"
          description="This match suggestion is no longer available. Browse the matches list for current suggestions."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/matches">Back to matches</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const score = Number(match.score);
  const tone =
    score >= 75
      ? "var(--confidence-high)"
      : score >= 50
        ? "var(--confidence-mid)"
        : "var(--confidence-low)";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 rounded-lg text-muted-foreground"
      >
        <Link to="/matches" data-ocid="match_detail.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to matches
        </Link>
      </Button>

      <header className="space-y-4 border-b border-border pb-8">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Match #{match.id.toString()}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Side-by-side comparison
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-3xl font-bold"
              style={{ color: `oklch(${tone})` }}
            >
              {formatScore(match.score)}
            </span>
            <span className="text-sm text-muted-foreground">
              confidence score
            </span>
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${score}%`, backgroundColor: `oklch(${tone})` }}
            />
          </div>
        </div>
        <p className="max-w-3xl rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-subtle">
          <span className="font-medium text-foreground">
            Why this matched:{" "}
          </span>
          {match.explanation}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ReportColumn report={match.lost} label="Lost report" />
        <ReportColumn report={match.found} label="Found report" />
      </div>
    </div>
  );
}
