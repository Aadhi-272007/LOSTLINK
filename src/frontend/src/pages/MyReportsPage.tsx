import { ReportKind, ReportStatus, type ReportView } from "@/backend";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import {
  ReportKindBadge,
  ReportStatusBadge,
} from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyReports, useWithdrawReport } from "@/hooks/use-backend";
import { formatDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { FileSearch, KeyRound, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function ReportRow({
  report,
  code,
  onWithdraw,
  withdrawing,
}: {
  report: ReportView;
  code: string;
  onWithdraw: (report: ReportView) => void;
  withdrawing: boolean;
}) {
  const canWithdraw =
    report.status === ReportStatus.active ||
    report.status === ReportStatus.hidden;
  return (
    <Card
      data-ocid="my_reports.item"
      className="rounded-xl border-border shadow-subtle"
    >
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ReportKindBadge kind={report.kind} />
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="truncate font-display text-base font-semibold text-foreground">
            {report.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {report.category} · {report.location} ·{" "}
            {formatDate(report.occurredAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg bg-card"
          >
            <Link
              to="/items/$reportId"
              params={{ reportId: report.id.toString() }}
              data-ocid="my_reports.view_button"
            >
              View
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg bg-card"
          >
            <Link
              to="/my-reports/$reportId/edit"
              params={{ reportId: report.id.toString() }}
              search={{ code }}
              data-ocid="my_reports.edit_button"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <ConfirmDialog
            title="Withdraw this report?"
            description="Withdrawing closes the report and removes it from public listings. This cannot be undone."
            confirmLabel="Withdraw report"
            destructive
            disabled={!canWithdraw || withdrawing}
            onConfirm={() => onWithdraw(report)}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="my_reports.withdraw_button"
                className="rounded-lg text-destructive hover:text-destructive"
                disabled={!canWithdraw}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Withdraw
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function MyReportsPage() {
  const [codeInput, setCodeInput] = useState("");
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const { data, isLoading, isError } = useMyReports(activeCode);
  const withdraw = useWithdrawReport();

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault();
    const code = codeInput.trim();
    if (!code) {
      toast.error(
        "Enter the management code you received when you submitted your report.",
      );
      return;
    }
    setActiveCode(code);
  };

  const handleWithdraw = (report: ReportView) => {
    if (!activeCode) return;
    withdraw.mutate(
      { id: report.id, code: activeCode },
      {
        onSuccess: () => toast.success("Report withdrawn."),
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "We couldn't withdraw that report.",
          ),
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader
        eyebrow="Your reports"
        title="My Reports"
        description="Enter the private management code you received when you submitted a report to view, edit, or withdraw it."
      />

      <Card className="mt-8 rounded-xl border-border shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <KeyRound className="size-5 text-primary" aria-hidden="true" />
            Access with your management code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLookup}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="my-reports-code">Management code</Label>
              <Input
                id="my-reports-code"
                data-ocid="my_reports.code_input"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                placeholder="Paste your private code"
                className="rounded-lg font-mono"
              />
            </div>
            <Button
              type="submit"
              data-ocid="my_reports.lookup_button"
              className="rounded-lg shadow-elevated"
            >
              View my reports
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        {!activeCode ? (
          <EmptyState
            icon={FileSearch}
            title="No code entered yet"
            description="Your management code is shown on the confirmation screen after you submit a report. Enter it above to manage your reports."
          />
        ) : isLoading ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <EmptyState
            data-ocid="error_state"
            title="We couldn't load your reports"
            description="Check that the management code is correct, then try again."
          />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No reports found for that code"
            description="Double-check the code — it is case-sensitive. If you lost it, you can still browse the board for your item."
            action={
              <Button asChild className="rounded-lg shadow-elevated">
                <Link to="/lost">Browse lost items</Link>
              </Button>
            }
          />
        ) : (
          data?.map((report) => (
            <ReportRow
              key={report.id.toString()}
              report={report}
              code={activeCode}
              onWithdraw={handleWithdraw}
              withdrawing={withdraw.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
