import { createFileRoute, Link } from "@tanstack/react-router";
import ContentPage from "@/components/common/ContentPage";

export const Route = createFileRoute("/_site/how-it-works")({
  head: () => ({ meta: [{ title: "How it works — LostLink" }] }),
  component: () => (
    <ContentPage
      eyebrow="How it works"
      title="From “it's gone” to “got it back”"
      intro="LostLink is a shared board with a matcher behind it. You never need an account, and staff stay in the loop for every handover."
      sections={[
        {
          heading: "1. Report the item",
          body: [
            "Post what you lost or what you found. Title, description, category, location and date are what the matcher uses, so the more specific the description the better the result.",
            "You get a private management code when you submit. It is the only key to editing or withdrawing that report, so save it.",
          ],
        },
        {
          heading: "2. The matcher compares everything",
          body: [
            "Every new report is scored against every report on the opposite board, out of 100.",
          ],
          list: [
            "Same category: up to 35 points",
            "Similar item name: up to 30 points",
            "Overlapping description details: up to 15 points",
            "Nearby location: up to 12 points",
            "Reported within a week of each other: up to 8 points",
          ],
        },
        {
          heading: "3. Claim a found item",
          body: [
            "If something on the found board is yours, open it and file a claim with proof of ownership — a serial number, what's inside, a photo of you with it.",
            "Claims are reviewed by campus staff. Contact details on reports are never public, so nothing is handed over on trust alone.",
          ],
        },
        {
          heading: "4. Collect with a return code",
          body: [
            "An approved claim issues a single-use return code valid for 72 hours. Bring it to the desk; staff verify it, the code burns, and the item is marked returned.",
          ],
        },
        {
          heading: "QR codes",
          body: [
            "Every report has a QR code you can download or print. Stick it on the item — a water bottle, a laptop sleeve, a folder — and anyone who scans it lands straight on that report.",
          ],
        },
      ]}
      footer={
        <div className="flex flex-wrap gap-3">
          <Link
            to="/report"
            search={{ kind: "lost" }}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Report a lost item
          </Link>
          <Link
            to="/scan"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            Scan a QR code
          </Link>
        </div>
      }
    />
  ),
});