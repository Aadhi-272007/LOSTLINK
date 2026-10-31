import { createFileRoute } from "@tanstack/react-router";
import BrowseView from "@/components/browse/BrowseView";
import { listReports } from "@/lib/reports-fns";

export const Route = createFileRoute("/_site/lost")({
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
        kind: "lost",
        category: deps.category,
        q: deps.q,
        sort: deps.sort,
        page: deps.page ?? 1,
      },
    }),
  head: () => ({
    meta: [
      { title: "Lost items — LostLink" },
      { name: "description", content: "Everything reported lost on campus, newest first." },
    ],
  }),
  component: LostPage,
});

function LostPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  return <BrowseView kind="lost" data={data} search={search} />;
}