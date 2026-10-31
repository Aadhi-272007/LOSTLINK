import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/common/PageHeader";
import ReturnVerifier from "@/components/returns/ReturnVerifier";

export const Route = createFileRoute("/_site/return-verify")({
  head: () => ({
    meta: [
      { title: "Verify a return code — LostLink" },
      {
        name: "description",
        content: "Campus staff verify a single-use return code before handing an item over.",
      },
    ],
  }),
  component: ReturnVerifyPage,
});

function ReturnVerifyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader
        eyebrow="Handover"
        title="Verify a return code"
        description="When a claim is approved, the claimant gets a single-use code valid for 72 hours. Check it here before handing the item over."
      />
      <div className="mt-8">
        <ReturnVerifier />
      </div>
      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">How the handover works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Staff approve a claim in the dashboard, which issues the code.</li>
          <li>The claimant shows the code when they collect the item.</li>
          <li>Verifying it marks the report returned and burns the code.</li>
        </ol>
      </div>
    </div>
  );
}