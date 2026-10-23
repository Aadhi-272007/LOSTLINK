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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";

import type { MockActor } from "./mock-actor";

/**
 * Mutable state a test file's `vi.mock` factory reads. Create it with
 * `vi.hoisted` at module scope so the hoisted mock factory can close over it:
 *
 * ```ts
 * const core = vi.hoisted(() => createCoreHolder());
 * vi.mock("@caffeineai/core-infrastructure", () => coreInfrastructureMock(core));
 * ```
 */
export interface CoreHolder {
  actor: MockActor | null;
  isFetching: boolean;
  isAuthenticated: boolean;
  login: () => void;
}

export function createCoreHolder(): CoreHolder {
  return {
    actor: null,
    isFetching: false,
    isAuthenticated: false,
    login: () => undefined,
  };
}

/** The module factory for `vi.mock("@caffeineai/core-infrastructure", ...)`. */
export function coreInfrastructureMock(holder: CoreHolder) {
  return {
    useActor: () => ({ actor: holder.actor, isFetching: holder.isFetching }),
    useInternetIdentity: () => ({
      identity: undefined,
      login: holder.login,
      clear: () => undefined,
      loginStatus: holder.isAuthenticated ? "success" : "idle",
      isInitializing: false,
      isLoginIdle: !holder.isAuthenticated,
      isLoggingIn: false,
      isLoginSuccess: holder.isAuthenticated,
      isLoginError: false,
      isSessionExpired: false,
      isAuthenticated: holder.isAuthenticated,
    }),
    InternetIdentityProvider: ({ children }: { children: ReactElement }) =>
      children,
    loadConfig: async () => ({}),
    createActorWithConfig: () => undefined,
    loadMockBackendFromModules: () => undefined,
  };
}

/**
 * The app's route tree, rebuilt for tests with a memory history so a test can
 * start at any URL and assert on the resulting search params. It mirrors
 * `src/App.tsx`; the pages themselves are the real production components.
 */
function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: AppLayout });

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

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export interface RenderAppResult extends RenderResult {
  router: ReturnType<typeof buildTestRouter>;
}

/**
 * Render the real app shell at `initialPath` with a fresh QueryClient and a
 * memory-history router. The caller must have mocked
 * `@caffeineai/core-infrastructure` first (see `mockCoreInfrastructure`).
 */
export function renderAppAt(initialPath = "/"): RenderAppResult {
  const router = buildTestRouter(initialPath);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router };
}
