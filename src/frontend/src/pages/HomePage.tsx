import { ReportKind, SortOrder } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { ItemCard } from "@/components/common/ItemCard";
import { ItemGridSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatches, useReports } from "@/hooks/use-backend";
import { APP_TAGLINE } from "@/lib/constants";
import { formatScore } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  FileSearch,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Report it",
    body: "Describe what you lost or found in under a minute. No account required — you get a private management code instead.",
  },
  {
    icon: Sparkles,
    title: "We match it",
    body: "LostLink compares every new report against the board using weighted attribute matching and surfaces likely pairs.",
  },
  {
    icon: BadgeCheck,
    title: "Claim it",
    body: "File a claim with proof of ownership. Staff review it and issue a single-use return code when approved.",
  },
  {
    icon: QrCode,
    title: "Return it",
    body: "Scan the return code at handover. The item is marked returned and the loop closes — verified, once.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Contact details stay hidden from public listings and are only revealed through an approved claim.",
  },
  {
    icon: ScanLine,
    title: "Verified handovers",
    body: "Every return is confirmed with a single-use, expiring QR code so items reach the right person.",
  },
  {
    icon: BellRing,
    title: "Nothing gets buried",
    body: "Match suggestions and claim activity are tracked against your reports so you always know the next step.",
  },
];

function scoreTone(score: number): string {
  if (score >= 75) return "var(--confidence-high)";
  if (score >= 50) return "var(--confidence-mid)";
  return "var(--confidence-low)";
}

export function HomePage() {
  const { data, isLoading } = useReports({
    page: 1n,
    pageSize: 6n,
    sort: SortOrder.newest,
  });
  const { data: matchData, isLoading: matchesLoading } = useMatches();

  const recent = data?.items ?? [];
  const topMatches = [...(matchData ?? [])]
    .sort((a, b) => Number(b.score - a.score))
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary shadow-subtle">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Campus Lost &amp; Found
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Find It. <span className="text-gradient-primary">Match It.</span>{" "}
              Return It.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              {APP_TAGLINE} Report what you lost or found, let automatic
              matching do the detective work, and hand items back with a
              verified, single-use return code.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="rounded-lg shadow-elevated">
                <Link
                  to="/report"
                  search={{ kind: ReportKind.lost }}
                  data-ocid="home.lost_button"
                >
                  I Lost Something
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-lg bg-card"
              >
                <Link
                  to="/report"
                  search={{ kind: ReportKind.found }}
                  data-ocid="home.found_button"
                >
                  I Found Something
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-lg">
                <Link to="/scan" data-ocid="home.scan_button">
                  <QrCode className="size-4" aria-hidden="true" />
                  Scan QR Code
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-[0.07] blur-2xl"
              aria-hidden="true"
            />
            <Card className="relative rounded-xl border-border shadow-floating">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Match signal
                  </p>
                  {topMatches.length > 0 ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[oklch(var(--confidence-high))]">
                      <span className="size-2 animate-pulse-ring rounded-full bg-[oklch(var(--confidence-high))]" />
                      {topMatches.length} active
                    </span>
                  ) : null}
                </div>
                {matchesLoading ? (
                  <div className="space-y-3" aria-hidden="true">
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="space-y-1.5">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : topMatches.length === 0 ? (
                  <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No matches yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      As lost and found reports are posted, likely pairs appear
                      here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMatches.map((match) => {
                      const score = Number(match.score);
                      const tone = scoreTone(score);
                      return (
                        <Link
                          key={match.id.toString()}
                          to="/matches/$matchId"
                          params={{ matchId: match.id.toString() }}
                          className="block space-y-1.5 rounded-lg transition-smooth hover:bg-muted/40"
                          data-ocid="home.match_row"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-foreground">
                              {match.lost.title} ↔ {match.found.title}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatScore(match.score)}
                            </span>
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
                        </Link>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Confidence scores blend title, description, category,
                  location, and timing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recently reported */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Recently reported
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Fresh on the board
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-lg bg-card">
              <Link to="/lost" data-ocid="home.browse_button">
                Browse all items
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <ItemGridSkeleton count={6} />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No reports yet"
              description="Be the first to post. Whether you lost something or found something, a report takes less than a minute."
              action={
                <Button asChild className="rounded-lg shadow-elevated">
                  <Link to="/report" data-ocid="home.empty_report_button">
                    Report an item
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((report, index) => (
                <ItemCard
                  key={report.id.toString()}
                  report={report}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mb-12 max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Four steps from lost to found
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              A single, deliberate flow — no accounts to create, no dead ends.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Card
                key={step.title}
                className="rounded-xl border-border shadow-subtle"
              >
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Built for trust
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Safety and privacy, not afterthoughts
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                LostLink is designed so that the person who gets the item back
                is the person who owns it — and nobody else sees your personal
                details along the way.
              </p>
              <Button asChild variant="outline" className="rounded-lg bg-card">
                <Link to="/safety" data-ocid="home.safety_link">
                  Read our safety approach
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {TRUST.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-xl border-border shadow-subtle"
                >
                  <CardContent className="space-y-3 pt-6">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-primary px-6 py-14 text-center shadow-floating sm:px-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Something missing? Start here.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-primary-foreground/85 md:text-lg">
              Post a report in under a minute and let matching bring it back to
              you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-lg shadow-elevated"
              >
                <Link
                  to="/report"
                  search={{ kind: ReportKind.lost }}
                  data-ocid="home.cta_lost_button"
                >
                  Report a lost item
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-lg border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link
                  to="/report"
                  search={{ kind: ReportKind.found }}
                  data-ocid="home.cta_found_button"
                >
                  Report a found item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
