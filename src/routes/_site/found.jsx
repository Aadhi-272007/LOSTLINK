import { createFileRoute } from "@tanstack/react-router";
import BrowseView from "@/components/browse/BrowseView";
import { listReports } from "@/lib/reports-fns";

export const Route = createFileRoute("/_site/found")({
  validateSearch: (search) => ({
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    sort: search.sort === "oldest" ? "oldest" : undefined,
    page: search.page ? Number(search.page) || 1 : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    listReports({
      data: {
        kind: "found",
        category: deps.category,
        q: deps.q,
        sort: deps.sort,
        page: deps.page ?? 1,
      },
    }),
  head: () => ({
    meta: [
      { title: "Found items — LostLink" },
      { name: "description", content: "Items handed in on campus, waiting to be claimed." },
    ],
  }),
  component: FoundPage,
});

function FoundPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  return <BrowseView kind="found" data={data} search={search} />;
}