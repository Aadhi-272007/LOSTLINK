import { EmptyState } from "@/components/common/EmptyState";
import { ItemGridSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ReportKindBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatches } from "@/hooks/use-backend";
import { formatRelative, formatScore } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

function scoreTone(score: number): string {
  if (score >= 75) return "var(--confidence-high)";
  if (score >= 50) return "var(--confidence-mid)";
  return "var(--confidence-low)";
}

export function MatchesPage() {
  const { data, isLoading, isError } = useMatches();
  const matches = data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader
        eyebrow="Automatic matching"
        title="Match Suggestions"
        description="Lost and found reports that share attributes, ranked by confidence. Open a match to compare both reports side by side."
      />

      <div className="mt-8">
        {isLoading ? (
          <ItemGridSkeleton count={4} />
        ) : isError ? (
          <EmptyState
            data-ocid="error_state"
            title="We couldn't load matches"
            description="Something went wrong while fetching match suggestions. Please try again."
            action={
              <Button
                type="button"
                className="rounded-lg"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matches yet"
            description="Matches appear automatically as lost and found reports are posted. Check back after more items are on the board."
            action={
              <Button asChild className="rounded-lg shadow-elevated">
                <Link to="/report">Report an item</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {matches.map((match, index) => {
              const score = Number(match.score);
              const tone = scoreTone(score);
              return (
                <Card
                  key={match.id.toString()}
                  data-ocid={`match_card.${index + 1}`}
                  className="rounded-xl border-border shadow-subtle transition-smooth hover:border-primary/30 hover:shadow-elevated"
                >
                  <CardContent className="space-y-5 pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Match #{match.id.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(match.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className="font-mono text-2xl font-bold"
                          style={{ color: `oklch(${tone})` }}
                        >
                          {formatScore(match.score)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          confidence
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${score}%`,
                          backgroundColor: `oklch(${tone})`,
                        }}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-lg border border-border bg-muted/30 p-3">
                        <ReportKindBadge
                          kind={match.lost.kind}
                          className="mb-2"
                        />
                        <p className="truncate text-sm font-medium text-foreground">
                          {match.lost.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {match.lost.location}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg border border-border bg-muted/30 p-3">
                        <ReportKindBadge
                          kind={match.found.kind}
                          className="mb-2"
                        />
                        <p className="truncate text-sm font-medium text-foreground">
                          {match.found.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {match.found.location}
                        </p>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {match.explanation}
                    </p>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-lg bg-card"
                    >
                      <Link
                        to="/matches/$matchId"
                        params={{ matchId: match.id.toString() }}
                        data-ocid={`match.open_button.${index + 1}`}
                      >
                        Compare reports
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
