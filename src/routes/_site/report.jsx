import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ReportForm from "@/components/reports/ReportForm";
import ReportSuccess from "@/components/reports/ReportSuccess";
import { saveCode } from "@/lib/mine";
import { describeSaveError } from "@/lib/save-error";

export const Route = createFileRoute("/_site/report")({
  validateSearch: (search) => ({
    kind: search.kind === "found" ? "found" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Report an item — LostLink" },
      {
        name: "description",
        content: "Post a lost or found item in under a minute. No account required.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const search = Route.useSearch();
  const [kind, setKind] = useState(search.kind === "found" ? "found" : "lost");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, ...payload }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const label = body.label ? `${body.label}: ` : "";
        throw new Error(`${label}${body.error ?? "the server didn't accept the report."}`);
      }
      const created = body;
      saveCode({
        id: created.id,
        code: created.management_code,
        title: created.title,
        kind: created.kind,
      });
      setResult(created);
    } catch (err) {
      setError(
        describeSaveError(err, "We couldn't save that report. Check the fields and try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  if (result) return <ReportSuccess result={result} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-fast hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the board
      </Link>

      <div className="mt-6">
        <PageHeader
          eyebrow="New report"
          title={kind === "lost" ? "Report something you lost" : "Report something you found"}
          description="Takes about a minute. Your contact details stay private — only campus staff can see them."
        />
      </div>

      <div className="mt-8">
        <ReportForm
          kind={kind}
          onKindChange={setKind}
          onSubmit={handleSubmit}
          busy={busy}
          error={error}
          submitLabel={kind === "lost" ? "Publish lost report" : "Publish found report"}
        />
      </div>
    </div>
  );
}