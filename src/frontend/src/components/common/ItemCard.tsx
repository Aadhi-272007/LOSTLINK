import type { ReportView } from "@/backend";
import {
  ReportKindBadge,
  ReportStatusBadge,
} from "@/components/common/StatusBadge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ImageOff, MapPin } from "lucide-react";

interface ItemCardProps {
  report: ReportView;
  index?: number;
  className?: string;
}

export function ItemCard({ report, index, className }: ItemCardProps) {
  const ocid = index === undefined ? "item_card" : `item_card.${index + 1}`;
  return (
    <Link
      to="/items/$reportId"
      params={{ reportId: report.id.toString() }}
      data-ocid={ocid}
      className="group block rounded-xl focus-visible:outline-none"
      aria-label={`${report.title} — ${report.kind} item`}
    >
      <Card
        className={cn(
          "h-full overflow-hidden rounded-xl border-border shadow-subtle transition-smooth group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-elevated",
          className,
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {report.photo ? (
            <img
              src={report.photo}
              alt={report.title}
              loading="lazy"
              className="size-full object-cover transition-smooth group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <ReportKindBadge kind={report.kind} />
          </div>
        </div>
        <CardHeader className="gap-2 pb-0">
          <h3 className="line-clamp-1 font-display text-lg font-semibold tracking-tight text-foreground">
            {report.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {truncate(report.description, 120)}
          </p>
        </CardHeader>
        <CardContent className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="truncate">{report.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{formatDate(report.occurredAt)}</span>
          </p>
        </CardContent>
        <CardFooter className="mt-auto flex-wrap gap-2 border-t border-border pt-4">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {report.category}
          </span>
          <ReportStatusBadge status={report.status} />
        </CardFooter>
      </Card>
    </Link>
  );
}
