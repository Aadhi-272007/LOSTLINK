import { ClaimStatus, type ClaimView, ReportStatus } from "@/backend";
import { SortOrder } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import {
  ClaimStatusBadge,
  ReportStatusBadge,
} from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminApproveClaim,
  useAdminAudit,
  useAdminClaims,
  useAdminDisputeClaim,
  useAdminRejectClaim,
  useAdminSetReportStatus,
  useIsAdmin,
  useReports,
} from "@/hooks/use-backend";
import { formatDateTime } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Gavel,
  Loader2,
  LogIn,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AUDIT_PAGE_SIZE = 20n;

function ClaimRow({ claim }: { claim: ClaimView }) {
  const [note, setNote] = useState("");
  const approve = useAdminApproveClaim();
  const reject = useAdminRejectClaim();
  const dispute = useAdminDisputeClaim();

  const run = (
    mutation: {
      mutate: (
        vars: { id: bigint; note: string | null },
        options: {
          onSuccess: (data: unknown) => void;
          onError: (error: unknown) => void;
        },
      ) => void;
    },
    label: string,
    onDone?: (returnCode: string) => void,
  ) => {
    mutation.mutate(
      { id: claim.id, note: note.trim() || null },
      {
        onSuccess: (data) => {
          toast.success(`${label} recorded.`);
          setNote("");
          if (
            onDone &&
            data &&
            typeof data === "object" &&
            "returnCode" in data
          ) {
            onDone(String((data as { returnCode: string }).returnCode));
          }
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : `Couldn't ${label.toLowerCase()}.`,
          ),
      },
    );
  };

  const pending = approve.isPending || reject.isPending || dispute.isPending;

  return (
    <Card
      data-ocid="admin.claim_item"
      className="rounded-xl border-border shadow-subtle"
    >
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-display text-base font-semibold text-foreground">
              {claim.claimantName}
            </p>
            <p className="text-xs text-muted-foreground">
              Report #{claim.reportId.toString()} · filed{" "}
              {formatDateTime(claim.createdAt)}
            </p>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        {claim.reviewNote ? (
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Review note: </span>
            {claim.reviewNote}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={`claim-note-${claim.id.toString()}`}>
            Review note (optional)
          </Label>
          <Textarea
            id={`claim-note-${claim.id.toString()}`}
            data-ocid="admin.claim_note_textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add context for the decision."
            className="min-h-16 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            data-ocid="admin.approve_button"
            className="rounded-lg"
            disabled={pending}
            onClick={() =>
              run(approve, "Approval", (code) =>
                toast.success(`Return code issued: ${code}`),
              )
            }
          >
            {approve.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="admin.reject_button"
            className="rounded-lg text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => run(reject, "Rejection")}
          >
            <XCircle className="size-4" aria-hidden="true" />
            Reject
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-ocid="admin.dispute_button"
            className="rounded-lg"
            disabled={pending}
            onClick={() => run(dispute, "Dispute")}
          >
            <Gavel className="size-4" aria-hidden="true" />
            Mark disputed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModerationPanel() {
  const { data, isLoading } = useReports({
    page: 1n,
    pageSize: 24n,
    sort: SortOrder.newest,
  });
  const setStatus = useAdminSetReportStatus();

  const handleStatus = (id: bigint, status: ReportStatus) => {
    setStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("Report status updated."),
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Couldn't update the report.",
          ),
      },
    );
  };

  if (isLoading) return <ListSkeleton rows={4} />;
  if ((data?.items.length ?? 0) === 0) {
    return (
      <EmptyState
        title="No reports to moderate"
        description="Reports submitted by the community will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data?.items.map((report) => (
        <Card
          key={report.id.toString()}
          data-ocid="admin.report_item"
          className="rounded-xl border-border shadow-subtle"
        >
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="truncate font-display text-base font-semibold text-foreground">
                {report.title}
              </p>
              <p className="text-xs text-muted-foreground">
                #{report.id.toString()} · {report.kind} · {report.category} ·{" "}
                {report.location}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ReportStatusBadge status={report.status} />
              <Select
                value={report.status}
                onValueChange={(value) =>
                  handleStatus(report.id, value as ReportStatus)
                }
              >
                <SelectTrigger
                  data-ocid="admin.status_select"
                  className="w-36 rounded-lg"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ReportStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-lg bg-card"
              >
                <Link
                  to="/items/$reportId"
                  params={{ reportId: report.id.toString() }}
                >
                  View
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ClaimsPanel() {
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");
  const { data, isLoading } = useAdminClaims(
    statusFilter === "all" ? null : statusFilter,
  );

  if (isLoading) return <ListSkeleton rows={4} />;
  if ((data?.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No claims in this queue"
        description="Claims filed against found reports will appear here for review and approval."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label
          htmlFor="admin-claim-filter"
          className="text-sm text-muted-foreground"
        >
          Filter
        </Label>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as ClaimStatus | "all")
          }
        >
          <SelectTrigger
            id="admin-claim-filter"
            data-ocid="admin.claim_filter_select"
            className="w-44 rounded-lg"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(ClaimStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {data?.map((claim) => (
        <ClaimRow key={claim.id.toString()} claim={claim} />
      ))}
    </div>
  );
}

function AuditPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAudit(BigInt(page), AUDIT_PAGE_SIZE);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(data?.total ?? 0n) / Number(AUDIT_PAGE_SIZE)),
  );

  if (isLoading) return <ListSkeleton rows={6} />;
  if ((data?.items.length ?? 0) === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No audit events yet"
        description="Administrative actions such as moderation and claim decisions are recorded here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Action
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Subject
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-semibold md:table-cell"
              >
                Detail
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                When
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((event) => (
              <tr
                key={event.id.toString()}
                data-ocid="admin.audit_row"
                className="border-t border-border"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {event.action}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {event.subject}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {event.detail}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="admin.audit_prev_button"
            className="rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="admin.audit_next_button"
            className="rounded-lg"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminPage() {
  const { isAuthenticated, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShieldAlert}
          title="Staff sign-in required"
          description="The admin dashboard is restricted to staff accounts. Sign in with Internet Identity to continue."
          action={
            <Button
              type="button"
              data-ocid="admin.login_button"
              className="rounded-lg shadow-elevated"
              disabled={isLoggingIn}
              onClick={() => login()}
            >
              {isLoggingIn ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              Sign in
            </Button>
          }
        />
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShieldAlert}
          title="You don't have admin access"
          description="Your account is signed in but is not a staff account. If you believe this is a mistake, contact the LostLink team."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/">Back to home</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader
        eyebrow="Staff"
        title="Admin Dashboard"
        description="Moderate reports, review claims, and audit administrative actions across the LostLink board."
      />

      <Tabs defaultValue="claims" className="mt-8">
        <TabsList data-ocid="admin.tabs" className="rounded-lg">
          <TabsTrigger
            value="claims"
            data-ocid="admin.claims_tab"
            className="rounded-md"
          >
            Claims
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            data-ocid="admin.reports_tab"
            className="rounded-md"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            data-ocid="admin.audit_tab"
            className="rounded-md"
          >
            Audit log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="mt-6">
          <ClaimsPanel />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <ModerationPanel />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
