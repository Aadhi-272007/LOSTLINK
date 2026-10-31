import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin } from "lucide-react";
import ContentPage from "@/components/common/ContentPage";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({ meta: [{ title: "Contact — LostLink" }] }),
  component: () => (
    <ContentPage
      eyebrow="Contact"
      title="The Lost & Found desk"
      intro="Everything physical — handed-in items, collections and disputed claims — is handled by the campus desk."
      sections={[
        {
          heading: "Where to find us",
          body: [
            "Student Union building, ground floor, next to the information desk. Bring your management code or return code with you.",
          ],
        },
        {
          heading: "What the desk can do",
          list: [
            "Accept items handed in without a report",
            "Approve claims and confirm collection",
            "Remove a report that contains something it shouldn't",
            "Escalate suspected theft to campus security",
          ],
        },
      ]}
      footer={
        <div className="grid gap-3 rounded-xl border border-border bg-card p-5 shadow-subtle sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Email
              </p>
              <p className="text-sm">lostfound@yourcampus.edu</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Hours
              </p>
              <p className="text-sm">Mon–Fri, 9:00–17:00</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Desk
              </p>
              <p className="text-sm">Student Union, GF</p>
            </div>
          </div>
          <div className="sm:col-span-3 sm:pt-2">
            <Link
              to="/report"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Report an item instead
            </Link>
          </div>
        </div>
      }
    />
  ),
});