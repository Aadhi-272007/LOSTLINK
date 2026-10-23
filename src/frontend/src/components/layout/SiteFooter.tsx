import { APP_NAME, APP_TAGLINE, FOOTER_LINKS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const caffeineHref = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window === "undefined" ? "" : window.location.hostname,
  )}`;

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {APP_TAGLINE} A campus Lost &amp; Found that reunites people with
            what they lose.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Explore
          </h2>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={`footer.${link.to.replace(/^\//, "")}_link`}
                  className="text-sm text-muted-foreground transition-fast hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account" className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Manage
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/my-reports"
                data-ocid="footer.my_reports_link"
                className="text-sm text-muted-foreground transition-fast hover:text-foreground"
              >
                My Reports
              </Link>
            </li>
            <li>
              <Link
                to="/matches"
                data-ocid="footer.matches_link"
                className="text-sm text-muted-foreground transition-fast hover:text-foreground"
              >
                Match Suggestions
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                data-ocid="footer.admin_link"
                className="text-sm text-muted-foreground transition-fast hover:text-foreground"
              >
                Staff Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/return-verify"
                data-ocid="footer.return_verify_link"
                className="text-sm text-muted-foreground transition-fast hover:text-foreground"
              >
                Verify Return Code
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={caffeineHref}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
