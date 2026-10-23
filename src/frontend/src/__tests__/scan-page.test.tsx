import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor } from "./mock-actor";
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

describe("ScanPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("resolves a manually entered report code to its item detail page", async () => {
    const { actor } = createMockActor();
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/scan");
    await user.click(await screen.findByRole("tab", { name: /enter code/i }));
    await user.type(screen.getByLabelText("Report code or link"), "42");
    await user.click(screen.getByRole("button", { name: /open report/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/items/42");
    });
  });

  it("resolves a pasted report link to its item detail page", async () => {
    const { actor } = createMockActor();
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/scan");
    await user.click(await screen.findByRole("tab", { name: /enter code/i }));
    await user.type(
      screen.getByLabelText("Report code or link"),
      "https://lostlink.example/items/7",
    );
    await user.click(screen.getByRole("button", { name: /open report/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/items/7");
    });
  });

  it("rejects a code that is not a report reference", async () => {
    const { actor } = createMockActor();
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/scan");
    await user.click(await screen.findByRole("tab", { name: /enter code/i }));
    await user.type(screen.getByLabelText("Report code or link"), "not-a-code");
    await user.click(screen.getByRole("button", { name: /open report/i }));

    expect(
      await screen.findByText(/doesn't look like a lostlink report code/i),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/scan");
  });
});
