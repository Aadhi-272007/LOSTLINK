import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  PackageCheck,
  QrCode,
  ScanLine,
  Search,
  Sparkles,
} from "lucide-react";
import ItemCard from "@/components/common/ItemCard";
import { getStats, listReports } from "@/lib/reports-fns";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "LostLink — Find it. Match it. Return it." },
      {
        name: "description",
        content:
          "A campus lost and found board that automatically matches lost items with found ones, with QR codes and verified returns.",
      },
    ],
  }),
  loader: async () => {
    const [stats, recent] = await Promise.all([
      getStats(),
      listReports({ data: { page: 1, pageSize: 6 } }),
    ]);
    return { stats, recent };
  },
  component: HomePage,
});

const steps = [
  {
    icon: Camera,
    title: "Report it",
    body: "Describe the item in under a minute. No account needed — you get a private management code instead.",
  },
  {
    icon: Sparkles,
    title: "We match it",
    body: "Every new report is compared against the opposite board: category, wording, location and date.",
  },
  {
    icon: PackageCheck,
    title: "Claim it",
    body: "Found something? File a claim with proof of ownership so staff can approve the right person.",
  },
  {
    icon: QrCode,
    title: "Return it",
    body: "An approved claim issues a single-use return code, valid for 72 hours, checked at the desk.",
  },
];

function StatCard({ value, label, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <p className={`font-mono text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function HomePage() {
  const { stats, recent } = Route.useLoaderData();

  return (
    <div>
      <section className="hero-wash border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                Campus lost &amp; found
              </span>
              <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {APP_TAGLINE}
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                {APP_NAME} is the shared board for everything lost on campus. Post what you lost or
                found, and our matcher pairs reports that describe the same item — then QR codes and
                return codes get it back to its owner.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/report"
                  search={{ kind: "lost" }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5"
                >
                  I lost something
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/report"
                  search={{ kind: "found" }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  I found something
                </Link>
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary transition-fast hover:bg-primary/5"
                >
                  <QrCode className="h-4 w-4" aria-hidden="true" />
                  Scan a QR code
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                No account needed to report. Your contact details stay private.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard value={stats.lost} label="Open lost reports" tone="text-warning" />
              <StatCard value={stats.found} label="Items waiting to be claimed" tone="text-primary" />
              <StatCard value={stats.returned} label="Items returned" tone="text-success" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Latest on the board
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every active report, newest first.
            </p>
          </div>
          <Link
            to="/found"
            className="hidden text-sm font-semibold text-primary transition-fast hover:opacity-80 sm:inline-flex"
          >
            Browse everything
          </Link>
        </div>

        {recent.items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-semibold">Nothing on the board yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Be the first to post an item — the matcher starts working as soon as there are two
              reports to compare.
            </p>
            <Link
              to="/report"
              className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Report an item
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Four steps, no lost paperwork
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-6 shadow-subtle">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-mono text-xs text-muted-foreground">0{index + 1}</p>
                <h3 className="mt-1 font-heading text-base font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-foreground px-6 py-12 text-background sm:px-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                Found a phone, a wallet, a bag?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-background/70">
                Log it in 60 seconds and put a QR code on it. Whoever scans it lands straight on the
                report, and you keep control of the contact details.
              </p>
            </div>
            <Link
              to="/report"
              search={{ kind: "found" }}
              className="rounded-lg bg-background px-5 py-3 text-sm font-semibold text-foreground transition-smooth hover:-translate-y-0.5"
            >
              Post a found item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}