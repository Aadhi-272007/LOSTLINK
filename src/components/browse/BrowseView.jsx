import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import ItemCard from "@/components/common/ItemCard";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { CATEGORIES } from "@/lib/constants";

const selectClass =
  "rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground shadow-subtle outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20";

export default function BrowseView({ kind, data, search }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.q ?? "");
  const to = kind === "lost" ? "/lost" : "/found";
  const isLost = kind === "lost";

  const update = (patch) =>
    navigate({ to, search: { ...search, ...patch, page: undefined }, replace: true });

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <PageHeader
        eyebrow={isLost ? "Lost board" : "Found board"}
        title={isLost ? "Things people have lost" : "Things waiting to be claimed"}
        description={
          isLost
            ? "If you found one of these, open the report and get in touch — the reporter's contact details stay private until staff connect you."
            : "Recognise something? Open the report and file a claim with proof of ownership."
        }
      >
        <Link
          to="/report"
          search={{ kind }}
          className="inline-flex shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5"
        >
          {isLost ? "Report a lost item" : "Report a found item"}
        </Link>
      </PageHeader>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: term.trim() || undefined });
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search titles and descriptions"
            aria-label="Search reports"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <select
            value={search.category ?? ""}
            onChange={(event) => update({ category: event.target.value || undefined })}
            aria-label="Filter by category"
            className={selectClass}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={search.sort ?? "newest"}
            onChange={(event) => update({ sort: event.target.value === "oldest" ? "oldest" : undefined })}
            aria-label="Sort reports"
            className={selectClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {data.total} {data.total === 1 ? "report" : "reports"}
        {search.q ? ` matching “${search.q}”` : ""}
        {search.category ? ` in ${search.category}` : ""}
      </p>

      {data.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="No reports match those filters"
            description="Try a different category or clear the search. New reports appear here instantly."
            action={
              <Link
                to="/report"
                search={{ kind }}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Add a report
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => update({ page: data.page - 1 })}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-subtle transition-fast hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 font-mono text-sm text-muted-foreground">
            {data.page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= totalPages}
            onClick={() => update({ page: data.page + 1 })}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-subtle transition-fast hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}