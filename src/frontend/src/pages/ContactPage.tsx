import { ContentPage, ContentSection } from "@/components/common/ContentPage";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, MessageSquare } from "lucide-react";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email the team",
    body: "lostlink@campus.edu — for report questions, claim issues, and account help.",
  },
  {
    icon: MapPin,
    title: "Visit the Lost & Found desk",
    body: "Student Union, ground floor. Open weekdays 9:00–17:00 for in-person handovers.",
  },
  {
    icon: MessageSquare,
    title: "Report a problem",
    body: "Spotted a fraudulent listing or a claim that looks wrong? Tell us and staff will review it.",
  },
];

export function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Talk to the LostLink team"
      description="Questions about a report, a claim, or how matching works? Here's how to reach us."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {CHANNELS.map((channel) => (
          <Card
            key={channel.title}
            className="rounded-xl border-border shadow-subtle"
          >
            <CardContent className="space-y-3 pt-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <channel.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {channel.title}
              </h2>
              <p className="text-sm text-muted-foreground">{channel.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContentSection title="Before you write">
        <p>
          If your question is about a specific report, include its report number
          — you'll find it on the report's detail page and in the QR code link.
          Never send your management code by email.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
