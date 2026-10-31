import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { KindBadge, StatusBadge } from "@/components/common/Badges";
import { listMyReports, withdrawMyReport } from "@/lib/reports-fns";
import { readCodes, removeCode, saveCode } from "@/lib/mine";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_site/my-reports/")({
  ssr: false,
  head: () => ({ meta: [{ title: "My reports — LostLink" }] }),
  component: MyReportsPage,
});

function MyReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const saved = readCodes();
    if (!saved.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    const result = await listMyReports({ data: { codes: saved.map((entry) => entry.code) } });
    setItems(result.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recover = async (event) => {
    event.preventDefault();
    setNotice(null);
    const value = code.trim().toUpperCase();
    if (!value) return;
    const result = await listMyReports({ data: { codes: [value] } });
    if (!result.items.length) {
      setNotice("No report matches that code.");
      return;
    }
    for (const report of result.items) {
      saveCode({
        id: report.id,
        code: report.management_code,
        title: report.title,
        kind: report.kind,
      });
    }
    setCode("");
    setLoading(true);
    await load();
    setNotice("Report added to this browser.");
  };

  const withdraw = async (report) => {
    if (!window.confirm(`Withdraw “${report.title}”? It stops appearing on the board.`)) return;
    await withdrawMyReport({ data: { id: report.id, code: report.management_code } });
    removeCode(report.id);
    setLoading(true);
    await load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader
        eyebrow="Your reports"
        title="My reports"
        description="This browser remembers the management code for every report you post. Codes can be entered on any device."
      />

      <form onSubmit={recover} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter a management code (LL-XXXXXX)"
          aria-label="Management code"
          className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 font-mono text-sm uppercase tracking-wider shadow-subtle outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold shadow-subtle transition-fast hover:bg-muted"
        >
          Find report
        </button>
      </form>
      {notice && <p className="mt-2 text-xs text-muted-foreground">{notice}</p>}

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports on this device yet"
            description="Report an item to get a management code, or enter a code you saved earlier."
            action={
              <Link
                to="/report"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Report an item
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-border bg-card p-4 shadow-subtle"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <KindBadge kind={report.kind} />
                      <StatusBadge status={report.status} />
                    </div>
                    <Link
                      to="/items/$reportId"
                      params={{ reportId: report.id }}
                      className="mt-2 block truncate font-medium hover:text-primary"
                    >
                      {report.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {report.location} · {formatDate(report.occurred_at)} ·{" "}
                      <span className="font-mono">{report.management_code}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/my-reports/$reportId/edit"
                      params={{ reportId: report.id }}
                      search={{ code: report.management_code }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-fast hover:bg-muted"
                    >
                      Edit
                    </Link>
                    {["active", "hidden"].includes(report.status) && (
                      <button
                        type="button"
                        onClick={() => withdraw(report)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive transition-fast hover:bg-destructive/5"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}