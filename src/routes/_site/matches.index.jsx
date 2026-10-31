import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import MatchRow from "@/components/matches/MatchRow";
import { Skeleton } from "@/components/ui/skeleton";
import useJson from "@/hooks/useJson";

export const Route = createFileRoute("/_site/matches/")({
  head: () => ({
    meta: [
      { title: "Suggested matches — LostLink" },
      {
        name: "description",
        content: "Lost and found reports the matcher believes describe the same item.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { data, state, reload } = useJson("/api/matches");
  const matches = data?.matches ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <PageHeader
        eyebrow="Matching engine"
        title="Suggested matches"
        description="Every lost report compared against every found report. Anything scoring 40% or higher shows up here, best first."
      />

      {state === "loading" && (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-[104px] w-full rounded-xl" />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
          <p className="text-sm text-muted-foreground">
            The matches could not be loaded just now.
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-fast hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {state === "ready" && matches.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={Sparkles}
            title="No matches yet"
            description="Matches appear once there are lost and found reports describing similar items. Post one and the matcher runs instantly."
            action={
              <Link
                to="/report"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Report an item
              </Link>
            }
          />
        </div>
      )}

      {state === "ready" && matches.length > 0 && (
        <div className="mt-8 space-y-3">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}