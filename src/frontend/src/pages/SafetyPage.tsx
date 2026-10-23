import { ContentPage, ContentSection } from "@/components/common/ContentPage";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function SafetyPage() {
  return (
    <ContentPage
      eyebrow="Safety"
      title="Handing items back, safely"
      description="LostLink is built so that the person who receives an item is the person who owns it — and so that every handover is verified."
    >
      <ContentSection title="Verified handovers">
        <p>
          An approved claim issues a single-use return code. The code is scanned
          at the moment of handover, marks the item returned, and is then
          permanently spent. It cannot be reused, and it expires if it isn't
          used in time.
        </p>
      </ContentSection>

      <ContentSection title="Proof of ownership">
        <p>
          Claims require a detail only the true owner would know — a scratch, a
          sticker, a serial number, or the contents of a bag. Staff review every
          claim before approving it, and can mark a claim disputed if something
          doesn't add up.
        </p>
      </ContentSection>

      <ContentSection title="Meeting to collect">
        <p>
          Arrange handovers in a public, well-lit place — a front desk, a
          library help point, or a staffed office. Never share more personal
          information than the handover requires.
        </p>
      </ContentSection>

      <ContentSection title="Reporting abuse">
        <p>
          If a listing looks fraudulent or a claim feels wrong, contact the
          LostLink team. Staff can hide or remove reports, and every
          administrative action is recorded in an audit log.
        </p>
      </ContentSection>

      <Button asChild variant="outline" className="rounded-lg bg-card">
        <Link to="/contact" data-ocid="safety.contact_button">
          Contact the team
        </Link>
      </Button>
    </ContentPage>
  );
}
