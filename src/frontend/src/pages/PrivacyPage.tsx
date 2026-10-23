import { ContentPage, ContentSection } from "@/components/common/ContentPage";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="Your details stay yours"
      description="LostLink separates what the public sees from what only you and the person returning your item can see."
    >
      <ContentSection title="What is public">
        <p>
          Public listings show the item's title, description, category,
          location, date, status, and photo. That is everything a visitor needs
          to recognise an item — and nothing more.
        </p>
      </ContentSection>

      <ContentSection title="What stays private">
        <p>
          Your name, email, and phone number are never shown on public listings
          or detail pages. They are stored with your report and revealed only
          through an approved claim, so the person returning the item can reach
          you.
        </p>
      </ContentSection>

      <ContentSection title="Your management code">
        <p>
          When you submit a report you receive a private management code. That
          code is the only way to edit or withdraw your report later, so keep it
          somewhere safe. Anyone with the code can manage the report — treat it
          like a password.
        </p>
      </ContentSection>

      <ContentSection title="Photos and uploads">
        <p>
          Photos are validated for type and size before upload and stored
          through the platform's file storage. Only upload images you have the
          right to share.
        </p>
      </ContentSection>

      <Button asChild variant="outline" className="rounded-lg bg-card">
        <Link to="/contact" data-ocid="privacy.contact_button">
          Ask a privacy question
        </Link>
      </Button>
    </ContentPage>
  );
}
