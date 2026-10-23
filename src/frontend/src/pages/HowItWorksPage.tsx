import { ContentPage, ContentSection } from "@/components/common/ContentPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, FileSearch, QrCode, Sparkles, Upload } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "1. Report it",
    body: "Describe the item, choose a category and location, and add a photo if you have one. You don't need an account — you receive a private management code instead.",
  },
  {
    icon: Sparkles,
    title: "2. Let matching work",
    body: "Every new report is compared against the board using weighted attributes: title and description text, category, location, and timing. Likely pairs surface with a confidence score and a plain-language explanation.",
  },
  {
    icon: FileSearch,
    title: "3. File a claim",
    body: "If a found item is yours, file a claim with proof of ownership — a detail only the true owner would know. Staff review every claim before anything is handed over.",
  },
  {
    icon: BadgeCheck,
    title: "4. Verify the return",
    body: "When a claim is approved, a single-use return code is issued. Scanning it at handover marks the item returned — and the code cannot be reused or used after it expires.",
  },
];

export function HowItWorksPage() {
  return (
    <ContentPage
      eyebrow="How it works"
      title="From lost to found, in four steps"
      description="LostLink is a single, deliberate flow designed to get items back to their owners without friction or guesswork."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {STEPS.map((step) => (
          <Card
            key={step.title}
            className="rounded-xl border-border shadow-subtle"
          >
            <CardContent className="space-y-3 pt-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContentSection title="What makes a good report">
        <p>
          The more specific your description, the better matching works. Include
          colour, brand, size, and any distinguishing marks. For found items,
          note exactly where the item is being held so the owner knows where to
          collect it.
        </p>
      </ContentSection>

      <ContentSection title="QR codes, everywhere">
        <p>
          Every report generates a unique QR code that links straight to its
          detail page. Print it, stick it on a noticeboard, or scan it from a
          phone — the code always resolves to the current report.
        </p>
      </ContentSection>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-lg shadow-elevated">
          <Link to="/report" data-ocid="how_it_works.report_button">
            Report an item
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-lg bg-card">
          <Link to="/scan" data-ocid="how_it_works.scan_button">
            <QrCode className="size-4" aria-hidden="true" />
            Scan a QR code
          </Link>
        </Button>
      </div>
    </ContentPage>
  );
}
