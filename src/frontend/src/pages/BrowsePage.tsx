import { ReportKind, SortOrder } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { ItemCard } from "@/components/common/ItemCard";
import { ItemGridSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports } from "@/hooks/use-backend";
import {
  CATEGORIES,
  DEFAULT_PAGE_SIZE,
  LOCATIONS,
  PAGE_SIZE_OPTIONS,
  SORT_LABELS,
} from "@/lib/constants";
import { dateInputToTimestamp } from "@/lib/format";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Filter, Search, X } from "lucide-react";
import { useMemo } from "react";

export interface BrowseSearch {
  q?: string;
  category?: string;
  location?: string;
  from?: string;
  to?: string;
  sort?: SortOrder;
  page?: number;
  pageSize?: number;
}

interface BrowsePageProps {
  kind: ReportKind;
}

export function BrowsePage({ kind }: BrowsePageProps) {
  const search = useSearch({ strict: false }) as BrowseSearch;
  const navigate = useNavigate();

  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = search.sort ?? SortOrder.newest;

  const query = useMemo(
    () => ({
      kind,
      page: BigInt(page),
      pageSize: BigInt(pageSize),
      sort,
      search: search.q || undefined,
      category: search.category || undefined,
      location: search.location || undefined,
      fromDate: dateInputToTimestamp(search.from ?? ""),
      toDate: dateInputToTimestamp(search.to ?? ""),
    }),
    [
      kind,
      page,
      pageSize,
      sort,
      search.q,
      search.category,
      search.location,
      search.from,
      search.to,
    ],
  );

  const { data, isLoading, isError, error } = useReports(query);

  const update = (patch: Partial<BrowseSearch>) => {
    void navigate({
      to: kind === ReportKind.lost ? "/lost" : "/found",
      search: (prev: BrowseSearch) => ({
        ...prev,
        ...patch,
        page: patch.page ?? 1,
      }),
      replace: true,
    });
  };

  const clearFilters = () => {
    void navigate({
      to: kind === ReportKind.lost ? "/lost" : "/found",
      search: { sort, pageSize },
      replace: true,
    });
  };

  const hasFilters = Boolean(
    search.q || search.category || search.location || search.from || search.to,
  );
  const isLost = kind === ReportKind.lost;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader
        eyebrow={isLost ? "Lost items" : "Found items"}
        title={isLost ? "Lost Items" : "Found Items"}
        description={
          isLost
            ? "Everything reported missing on campus. Search, filter, and open a report to see its match suggestions."
            : "Everything handed in and waiting to be claimed. If one is yours, file a claim with proof of ownership."
        }
        actions={
          <Button asChild className="rounded-lg shadow-elevated">
            <a href="/report" data-ocid="browse.report_button">
              Report an item
            </a>
          </Button>
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-subtle">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Filter className="size-4 text-primary" aria-hidden="true" />
                Filters
              </h2>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid="browse.clear_button"
                  className="h-7 rounded-lg px-2 text-xs text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Clear
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="browse-search">Search</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="browse-search"
                  data-ocid="browse.search_input"
                  placeholder="Title or keyword"
                  defaultValue={search.q ?? ""}
                  className="rounded-lg pl-9"
                  onChange={(event) => update({ q: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="browse-category">Category</Label>
              <Select
                value={search.category ?? "all"}
                onValueChange={(value) =>
                  update({ category: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger
                  id="browse-category"
                  data-ocid="browse.category_select"
                  className="w-full rounded-lg"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="browse-location">Location</Label>
              <Select
                value={search.location ?? "all"}
                onValueChange={(value) =>
                  update({ location: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger
                  id="browse-location"
                  data-ocid="browse.location_select"
                  className="w-full rounded-lg"
                >
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="browse-from">From</Label>
                <Input
                  id="browse-from"
                  type="date"
                  data-ocid="browse.from_input"
                  value={search.from ?? ""}
                  className="rounded-lg"
                  onChange={(event) =>
                    update({ from: event.target.value || undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="browse-to">To</Label>
                <Input
                  id="browse-to"
                  type="date"
                  data-ocid="browse.to_input"
                  value={search.to ?? ""}
                  className="rounded-lg"
                  onChange={(event) =>
                    update({ to: event.target.value || undefined })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="browse-sort">Sort by</Label>
              <Select
                value={sort}
                onValueChange={(value) => update({ sort: value as SortOrder })}
              >
                <SelectTrigger
                  id="browse-sort"
                  data-ocid="browse.sort_select"
                  className="w-full rounded-lg"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="browse-page-size">Per page</Label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => update({ pageSize: Number(value) })}
              >
                <SelectTrigger
                  id="browse-page-size"
                  data-ocid="browse.page_size_select"
                  className="w-full rounded-lg"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 space-y-8">
          {isLoading ? (
            <ItemGridSkeleton count={6} />
          ) : isError ? (
            <EmptyState
              data-ocid="error_state"
              title="We couldn't load these items"
              description={
                error instanceof Error
                  ? error.message
                  : "Please try again in a moment."
              }
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
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title={
                hasFilters
                  ? "No items match your filters"
                  : isLost
                    ? "No lost items yet"
                    : "No found items yet"
              }
              description={
                hasFilters
                  ? "Try widening your search — remove a filter or clear them all to see everything on the board."
                  : "Nothing has been reported here yet. Post a report and it will appear immediately."
              }
              action={
                hasFilters ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild className="rounded-lg shadow-elevated">
                    <a href="/report">Report an item</a>
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data?.items.map((report, index) => (
                  <ItemCard
                    key={report.id.toString()}
                    report={report}
                    index={index}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                total={Number(data?.total ?? 0n)}
                onPageChange={(next) => update({ page: next })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
