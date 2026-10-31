import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import MatchDetail from "@/components/matches/MatchDetail";
import { Skeleton } from "@/components/ui/skeleton";
import useJson from "@/hooks/useJson";

export const Route = createFileRoute("/_site/matches/$matchId")({
  head: () => ({
    meta: [
      { title: "Match detail — LostLink" },
      {
        name: "description",
        content: "Two reports the matcher believes describe the same item.",
      },
    ],
  }),
  component: MatchDetailPage,
});

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const { data, state, reload } = useJson(`/api/matches?id=${encodeURIComponent(matchId)}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        to="/matches"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-fast hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All matches
      </Link>

      {state === "loading" && (
        <div className="mt-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      )}

      {state === "missing" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
          <h1 className="font-heading text-lg font-semibold">This match no longer exists</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One of the reports may have been withdrawn or returned since it was suggested.
          </p>
          <Link
            to="/matches"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            See all matches
          </Link>
        </div>
      )}

      {state === "error" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
          <p className="text-sm text-muted-foreground">This match could not be loaded just now.</p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-fast hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {state === "ready" && <MatchDetail match={data.match} />}
    </div>
  );
}