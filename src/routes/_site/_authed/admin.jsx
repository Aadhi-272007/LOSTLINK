import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ClipboardList, ShieldCheck, Undo2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AdminReports from "@/components/admin/AdminReports";
import ClaimRow from "@/components/admin/ClaimRow";
import ReturnVerifier from "@/components/returns/ReturnVerifier";
import { apiFetch } from "@/lib/api-client";

export const Route = createFileRoute("/_site/_authed/admin")({
  head: () => ({ meta: [{ title: "Staff dashboard — LostLink" }] }),
  loader: () => apiFetch("/api/admin"),
  component: AdminPage,
});

const tabs = [
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "claims", label: "Claims", icon: ShieldCheck },
  { id: "returns", label: "Verify return", icon: Undo2 },
];

function AdminPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState("reports");

  const moderate = async (id, status) => {
    await apiFetch("/api/admin", { method: "POST", body: { action: "moderate", id, status } });
    await router.invalidate();
  };

  const review = async (id, decision, note) => {
    const result = await apiFetch("/api/admin", {
      method: "POST",
      body: { action: "review", id, decision, note },
    });
    await router.invalidate();
    return result;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader
        eyebrow="Staff only"
        title="Lost &amp; found dashboard"
        description="Moderate the board, review ownership claims and verify handovers."
      />

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active reports", value: data.stats.active },
          { label: "Returned", value: data.stats.returned },
          { label: "Pending claims", value: data.stats.pendingClaims },
          { label: "Claims loaded", value: data.stats.claims },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-subtle">
            <dd className="font-mono text-2xl font-semibold">{stat.value}</dd>
            <dt className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex gap-2 border-b border-border pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-fast ${
              tab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "reports" && <AdminReports reports={data.reports} onModerate={moderate} />}
        {tab === "claims" && (
          <div className="space-y-3">
            {data.claims.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No claims have been filed yet.
              </p>
            ) : (
              data.claims.map((claim) => (
                <ClaimRow key={claim.id} claim={claim} onReview={review} />
              ))
            )}
          </div>
        )}
        {tab === "returns" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ask the claimant for the code from their approval, then verify it here.
            </p>
            <ReturnVerifier />
          </div>
        )}
      </div>
    </div>
  );
}