import { KindBadge, StatusBadge } from "@/components/common/Badges";
import { formatDate } from "@/lib/format";

const actions = [
  { label: "Hide", status: "hidden", hideWhen: ["hidden", "removed"] },
  { label: "Remove", status: "removed", hideWhen: ["removed"] },
  { label: "Restore", status: "active", hideWhen: ["active"] },
];

export default function AdminReports({ reports, onModerate }) {
  if (!reports.length) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No reports match this filter.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={report.kind} />
                <StatusBadge status={report.status} />
                <span className="text-xs text-muted-foreground">{report.category}</span>
              </div>
              <p className="mt-2 truncate font-medium">{report.title}</p>
              <p className="text-xs text-muted-foreground">
                {report.location} · {formatDate(report.occurred_at)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {report.contact_name} · {report.contact_email}
                {report.contact_phone ? ` · ${report.contact_phone}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions
                .filter((action) => !action.hideWhen.includes(report.status))
                .map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => onModerate(report.id, action.status)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-fast hover:bg-muted"
                  >
                    {action.label}
                  </button>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}