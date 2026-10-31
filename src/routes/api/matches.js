import { createFileRoute } from "@tanstack/react-router";
import { loadMatch } from "@/lib/reports-fns";
import { pairReports } from "@/lib/lostlink";
import { MATCH_THRESHOLD } from "@/lib/constants";

// Suggested matches for the whole board, or one match with `?id=`.
export const Route = createFileRoute("/api/matches")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const client = context.getBase44().asServiceRole;
        const id = new URL(request.url).searchParams.get("id");

        if (id) {
          const match = await loadMatch(client, id);
          if (!match) return Response.json({ error: "Match not found." }, { status: 404 });
          return Response.json({ match });
        }

        const [lost, found] = await Promise.all([
          client.entities.Report.filter(
            { kind: "lost", status: "active" },
            { sort: "-created_date", limit: 200 }
          ),
          client.entities.Report.filter(
            { kind: "found", status: "active" },
            { sort: "-created_date", limit: 200 }
          ),
        ]);
        const matches = pairReports(lost.items ?? [], found.items ?? [], MATCH_THRESHOLD).slice(
          0,
          60
        );
        return Response.json({ matches, count: matches.length });
      },
    },
  },
});