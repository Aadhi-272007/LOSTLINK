import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ReportDetail from "@/components/item/ReportDetail";
import { Skeleton } from "@/components/ui/skeleton";
import useJson from "@/hooks/useJson";

export const Route = createFileRoute("/_site/items/$reportId")({
  head: () => ({
    meta: [
      { title: "Report — LostLink" },
      { name: "description", content: "A lost or found report on the campus board." },
    ],
  }),
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { reportId } = Route.useParams();
  const { data, state, reload } = useJson(`/api/reports?id=${encodeURIComponent(reportId)}`);

  if (state === "ready") {
    return (
      <ReportDetail
        report={data.report}
        matches={data.matches ?? []}
        claimCount={data.claimCount ?? 0}
        canClaim={data.canClaim}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <Link
        to="/lost"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-fast hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the board
      </Link>

      {state === "loading" && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {state === "missing" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
          <h1 className="font-heading text-lg font-semibold">This report is no longer on the board</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been returned or withdrawn by the person who posted it.
          </p>
          <Link
            to="/found"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Browse found items
          </Link>
        </div>
      )}

      {state === "error" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
          <p className="text-sm text-muted-foreground">This report could not be loaded just now.</p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-fast hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}