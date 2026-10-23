import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { Menu, QrCode, Search } from "lucide-react";
import { useState } from "react";

function Wordmark() {
  return (
    <Link
      to="/"
      data-ocid="nav.logo_link"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-subtle">
        <Search className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        {APP_NAME}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`nav.${link.to.replace(/^\//, "").replace(/\//g, "-")}_link`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-fast hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden rounded-lg text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Link to="/scan" data-ocid="nav.scan_link">
              <QrCode className="size-4" aria-hidden="true" />
              Scan QR
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="hidden rounded-lg shadow-elevated sm:inline-flex"
          >
            <Link to="/report" data-ocid="nav.report_button">
              Report an Item
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid="nav.menu_button"
                aria-label="Open navigation menu"
                className="rounded-lg md:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              data-ocid="nav.mobile_sheet"
              className="w-72 bg-card"
            >
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    data-ocid={`nav.mobile.${link.to.replace(/^\//, "").replace(/\//g, "-")}_link`}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-fast hover:bg-muted hover:text-foreground"
                    activeProps={{ className: "text-foreground bg-muted" }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/scan"
                  onClick={() => setOpen(false)}
                  data-ocid="nav.mobile.scan_link"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-fast hover:bg-muted hover:text-foreground"
                >
                  Scan QR
                </Link>
                <Link
                  to="/my-reports"
                  onClick={() => setOpen(false)}
                  data-ocid="nav.mobile.my_reports_link"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-fast hover:bg-muted hover:text-foreground"
                >
                  My Reports
                </Link>
                <Button asChild className="mt-3 rounded-lg shadow-elevated">
                  <Link
                    to="/report"
                    onClick={() => setOpen(false)}
                    data-ocid="nav.mobile.report_button"
                  >
                    Report an Item
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
