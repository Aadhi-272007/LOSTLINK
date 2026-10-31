import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "@/components/common/ContentPage";

export const Route = createFileRoute("/_site/safety")({
  head: () => ({ meta: [{ title: "Safety — LostLink" }] }),
  component: () => (
    <ContentPage
      eyebrow="Safety"
      title="Handing items over safely"
      intro="Most lost & found problems are not theft — they are miscommunication. These rules keep handovers simple and safe."
      sections={[
        {
          heading: "Meet at the desk, not in private",
          body: [
            "Collect items from the campus Lost & Found desk during opening hours. Never arrange a handover in a car park, a hostel room or off campus.",
          ],
        },
        {
          heading: "Never send money to claim an item",
          body: [
            "No legitimate claim ever requires a payment, a delivery fee or a deposit. If someone asks, stop and report it to the desk.",
          ],
        },
        {
          heading: "Keep personal details off the board",
          body: [
            "Report descriptions are public. Don't include your phone number, email, student ID number or home address in them — the private contact fields exist for exactly that.",
          ],
        },
        {
          heading: "Report suspicious behaviour",
          body: [
            "Repeated false claims, pressure to hand over an item without a claim, or reports that are clearly someone else's property should go to campus security and the Lost & Found desk.",
          ],
        },
        {
          heading: "Photos are public",
          body: [
            "A report photo is visible to anyone using the board, and so is any QR code you print. Don't photograph ID cards, keys layouts, screenshots with personal data, or anything that reveals more than the item itself.",
          ],
        },
      ]}
    />
  ),
});