import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import ClaimForm from "@/components/item/ClaimForm";
import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import useJson from "@/hooks/useJson";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_site/items/$reportId_/claim")({
  head: () => ({
    meta: [
      { title: "Claim an item — LostLink" },
      {
        name: "description",
        content: "File an ownership claim on a found item with proof, reviewed by campus staff.",
      },
    ],
  }),
  component: ClaimPage,
});

function ClaimPage() {
  const { reportId } = Route.useParams();
  const { data, state, reload } = useJson(`/api/reports?id=${encodeURIComponent(reportId)}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        to="/items/$reportId"
        params={{ reportId }}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-fast hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the report
      </Link>

      <div className="mt-6">
        <PageHeader
          eyebrow="Ownership claim"
          title="Claim this item"
          description="Tell us what proves the item is yours. Staff compare your proof with the finder's report before anything is handed over."
        />
      </div>

      <div className="mt-6">
        {state === "loading" && <Skeleton className="h-40 w-full rounded-xl" />}

        {state === "ready" && (
          <>
            <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Claiming
              </p>
              <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
                {data.report.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.report.category} · {data.report.location} ·{" "}
                {formatDate(data.report.occurred_at)}
              </p>
            </div>

            <div className="mt-4">
              {data.canClaim ? (
                <ClaimForm reportId={data.report.id} />
              ) : (
                <div className="rounded-xl border border-border bg-muted/40 p-5">
                  <p className="inline-flex items-center gap-2 font-semibold">
                    <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    This item can no longer be claimed
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    It has already been returned, withdrawn or removed from the board.
                  </p>
                  <Link
                    to="/found"
                    className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Browse found items
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {state === "missing" && (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
            <h2 className="font-heading text-lg font-semibold">This report is no longer on the board</h2>
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
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-subtle">
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
    </div>
  );
}