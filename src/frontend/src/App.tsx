import { ReportKind } from "@/backend";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminPage } from "@/pages/AdminPage";
import { BrowsePage } from "@/pages/BrowsePage";
import { ContactPage } from "@/pages/ContactPage";
import { EditReportPage } from "@/pages/EditReportPage";
import { HomePage } from "@/pages/HomePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { ItemDetailPage } from "@/pages/ItemDetailPage";
import { MatchDetailPage } from "@/pages/MatchDetailPage";
import { MatchesPage } from "@/pages/MatchesPage";
import { MyReportsPage } from "@/pages/MyReportsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { ReportPage } from "@/pages/ReportPage";
import { ReturnVerifyPage } from "@/pages/ReturnVerifyPage";
import { SafetyPage } from "@/pages/SafetyPage";
import { ScanPage } from "@/pages/ScanPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        This page could not be found
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        The link may be broken or the page may have moved. Head back to the
        board to keep browsing.
      </p>
      <a
        href="/"
        data-ocid="not_found.home_link"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elevated transition-fast hover:opacity-90"
      >
        Back to home
      </a>
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const lostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lost",
  component: () => <BrowsePage kind={ReportKind.lost} />,
});

const foundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/found",
  component: () => <BrowsePage kind={ReportKind.found} />,
});

const reportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/report",
  component: ReportPage,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan",
  component: ScanPage,
});

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/items/$reportId",
  component: ItemDetailPage,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches",
  component: MatchesPage,
});

const matchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matches/$matchId",
  component: MatchDetailPage,
});

const myReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-reports",
  component: MyReportsPage,
});

const editReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-reports/$reportId/edit",
  component: EditReportPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const returnVerifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/return-verify",
  component: ReturnVerifyPage,
});

const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/how-it-works",
  component: HowItWorksPage,
});

const safetyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/safety",
  component: SafetyPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: PrivacyPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  lostRoute,
  foundRoute,
  reportRoute,
  scanRoute,
  itemDetailRoute,
  matchesRoute,
  matchDetailRoute,
  myReportsRoute,
  editReportRoute,
  adminRoute,
  returnVerifyRoute,
  howItWorksRoute,
  safetyRoute,
  privacyRoute,
  contactRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
