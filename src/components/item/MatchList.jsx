import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import ScoreRing from "@/components/common/ScoreRing";
import { formatDate } from "@/lib/format";

export default function MatchList({ matches, reportId }) {
  if (!matches.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-muted-foreground/60" aria-hidden="true" />
        <p className="mt-2 text-sm text-muted-foreground">
          No matches yet. We keep checking every time a new report is posted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => {
        const other = match.lost.id === reportId ? match.found : match.lost;
        return (
          <Link
            key={match.id}
            to="/matches/$matchId"
            params={{ matchId: match.id }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
          >
            <ScoreRing score={match.score} size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{other.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {other.category} · {other.location} · {formatDate(other.occurred_at)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}