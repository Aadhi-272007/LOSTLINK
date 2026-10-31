import { Link } from "@tanstack/react-router";
import ScoreRing from "@/components/common/ScoreRing";
import { KindBadge } from "@/components/common/Badges";
import { formatDate } from "@/lib/format";

export default function MatchRow({ match }) {
  return (
    <Link
      to="/matches/$matchId"
      params={{ matchId: match.id }}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-4">
        <ScoreRing score={match.score} size={56} />
        <div className="sm:w-56">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Lost
          </p>
          <p className="truncate font-medium">{match.lost.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {match.lost.location} · {formatDate(match.lost.occurred_at)}
          </p>
        </div>
      </div>
      <div className="hidden h-10 w-px bg-border sm:block" />
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Found
        </p>
        <p className="truncate font-medium">{match.found.title}</p>
        <p className="truncate text-xs text-muted-foreground">{match.explanation}</p>
      </div>
      <div className="flex gap-2">
        <KindBadge kind="lost" />
        <KindBadge kind="found" />
      </div>
    </Link>
  );
}