import { Link } from "@tanstack/react-router";
import { CalendarDays, ImageOff, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { KindBadge } from "@/components/common/Badges";
import { formatDate } from "@/lib/format";

export default function ItemCard({ item }) {
  return (
    <Link
      to="/items/$reportId"
      params={{ reportId: item.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.title}
            className="h-full w-full object-cover transition-smooth group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <KindBadge kind={item.kind} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 font-heading text-base font-semibold tracking-tight">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {item.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(item.occurred_at)}
          </span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          {item.category}
        </span>
      </div>
    </Link>
  );
}