import { Link } from "@tanstack/react-router";
import { ImageOff, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import ScoreRing from "@/components/common/ScoreRing";
import { KindBadge } from "@/components/common/Badges";
import { formatDate } from "@/lib/format";

function ReportColumn({ label, report }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <div className="flex items-center justify-between gap-2">
        <KindBadge kind={report.kind} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg bg-muted">
        {report.photo_url ? (
          <Image
            src={report.photo_url}
            alt={report.title}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground/40">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold tracking-tight">{report.title}</h2>
      <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{report.description}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {report.location} · {formatDate(report.occurred_at)}
      </p>
      <Link
        to="/items/$reportId"
        params={{ reportId: report.id }}
        className="mt-4 inline-flex w-full justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-fast hover:bg-muted"
      >
        Open this report
      </Link>
    </div>
  );
}

export default function MatchDetail({ match }) {
  return (
    <>
      <div className="mt-6 flex flex-col items-start gap-5 rounded-xl border border-border bg-card p-6 shadow-subtle sm:flex-row sm:items-center">
        <ScoreRing score={match.score} size={72} />
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Likely the same item</h1>
          <p className="mt-1 text-sm text-muted-foreground">{match.explanation}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            A score is a hint, not proof. Staff confirm ownership through a claim before anything is
            handed over.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ReportColumn label="Lost report" report={match.lost} />
        <ReportColumn label="Found report" report={match.found} />
      </div>
    </>
  );
}