import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "@/components/common/ContentPage";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({ meta: [{ title: "Privacy — LostLink" }] }),
  component: () => (
    <ContentPage
      eyebrow="Privacy"
      title="What we store, and who can see it"
      intro="LostLink is built so a public board never becomes a public contact list."
      sections={[
        {
          heading: "Public on the board",
          body: ["Anyone using the board can see these fields on an active report:"],
          list: [
            "Item title, description and category",
            "Where and when it was lost or found",
            "Where a found item is being held",
            "The photo you uploaded, and the report's QR code",
          ],
        },
        {
          heading: "Private, staff only",
          body: [
            "Your name, email and phone number are never included in public listings. They are visible only to campus staff in the dashboard, so a handover can be arranged.",
          ],
        },
        {
          heading: "Your management code",
          body: [
            "The code issued when you submit a report controls editing and withdrawal of that report. It is stored in your browser and shown only to you; staff never post it publicly.",
          ],
        },
        {
          heading: "Claims",
          body: [
            "A claim stores your name, email, optional phone number and your proof of ownership. Only staff reviewing the claim can read them, and only the outcome and any staff note appear on the item.",
          ],
        },
        {
          heading: "Removing your data",
          body: [
            "Withdraw a report from My reports at any time — it disappears from the board immediately. To delete a report and its claims entirely, ask the Lost & Found desk to remove it.",
          ],
        },
      ]}
    />
  ),
});