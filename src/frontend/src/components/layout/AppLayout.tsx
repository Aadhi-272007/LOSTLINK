import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" data-ocid="page" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}
