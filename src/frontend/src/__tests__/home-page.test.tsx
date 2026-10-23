import { ReportKind } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, makeReport } from "./mock-actor";
import { renderAppAt } from "./render-app";

const core = vi.hoisted(() => ({
  actor: null as unknown,
  isFetching: false,
  isAuthenticated: false,
  login: () => undefined,
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: core.actor, isFetching: core.isFetching }),
  useInternetIdentity: () => ({
    identity: undefined,
    login: core.login,
    clear: () => undefined,
    loginStatus: core.isAuthenticated ? "success" : "idle",
    isInitializing: false,
    isLoginIdle: !core.isAuthenticated,
    isLoggingIn: false,
    isLoginSuccess: core.isAuthenticated,
    isLoginError: false,
    isSessionExpired: false,
    isAuthenticated: core.isAuthenticated,
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  loadConfig: async () => ({}),
  createActorWithConfig: () => undefined,
  loadMockBackendFromModules: () => undefined,
}));

describe("HomePage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("renders the hero tagline and the three primary actions", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;

    renderAppAt("/");

    expect(
      await screen.findByRole("heading", {
        name: /find it\.\s*match it\.\s*return it\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /i lost something/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /i found something/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /scan qr code/i }),
    ).toBeInTheDocument();
  });

  it("shows the empty state when no reports exist", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;

    renderAppAt("/");

    expect(await screen.findByText(/no reports yet/i)).toBeInTheDocument();
  });

  it("lists recent reports returned by the backend", async () => {
    const { actor } = createMockActor({
      reports: [makeReport({ id: 7n, title: "Silver water bottle" })],
    });
    core.actor = actor;

    renderAppAt("/");

    expect(await screen.findByText("Silver water bottle")).toBeInTheDocument();
  });

  it("navigates to the lost report form from the hero action", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/");
    await user.click(
      await screen.findByRole("link", { name: /i lost something/i }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/report");
    });
    expect(router.state.location.search).toMatchObject({
      kind: ReportKind.lost,
    });
  });
});
