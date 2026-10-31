import { Link } from "@tanstack/react-router";
import { APP_NAME, APP_TAGLINE, FOOTER_LINKS } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">{APP_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {APP_TAGLINE} A campus lost &amp; found board that matches items for you.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-foreground/80 transition-fast hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your reports
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/my-reports" className="text-foreground/80 transition-fast hover:text-primary">
                Manage my reports
              </Link>
            </li>
            <li>
              <Link to="/return-verify" className="text-foreground/80 transition-fast hover:text-primary">
                Verify a return code
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-foreground/80 transition-fast hover:text-primary">
                Staff dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {APP_NAME}. Contact details on reports are always private.
      </div>
    </footer>
  );
}