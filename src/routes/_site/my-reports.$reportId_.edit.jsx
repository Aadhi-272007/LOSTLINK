import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ReportForm from "@/components/reports/ReportForm";
import { getMyReport, updateMyReport } from "@/lib/reports-fns";
import { describeSaveError } from "@/lib/save-error";

export const Route = createFileRoute("/_site/my-reports/$reportId_/edit")({
  ssr: false,
  validateSearch: (search) => ({
    code: typeof search.code === "string" && search.code ? search.code : undefined,
  }),
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: ({ params, deps }) =>
    deps.code ? getMyReport({ data: { id: params.reportId, code: deps.code } }) : null,
  head: () => ({ meta: [{ title: "Edit report — LostLink" }] }),
  component: EditReportPage,
});

function EditReportPage() {
  const report = Route.useLoaderData();
  const { code } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="We need your management code"
          description="Editing a report requires the code issued when it was posted. Open it from My reports, or enter the code there."
          action={
            <Link
              to="/my-reports"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Go to my reports
            </Link>
          }
        />
      </div>
    );
  }

  const save = async (payload) => {
    setBusy(true);
    setError(null);
    try {
      const result = await updateMyReport({ data: { id: report.id, code, ...payload } });
      if (!result.ok) {
        setError("This report can't be edited anymore.");
        return;
      }
      navigate({ to: "/my-reports" });
    } catch (err) {
      setError(
        describeSaveError(err, "We couldn't save the changes. Check the fields and try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader
        eyebrow={`Management code ${report.management_code}`}
        title="Edit your report"
        description="Changes apply to the public board immediately and re-run matching."
      />
      <div className="mt-8">
        {busy && (
          <p className="mb-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Saving…
          </p>
        )}
        <ReportForm
          kind={report.kind}
          initial={report}
          onSubmit={save}
          busy={busy}
          error={error}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}