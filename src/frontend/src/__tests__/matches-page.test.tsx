import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, makeMatch } from "./mock-actor";
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

describe("MatchesPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("shows each match with its confidence score and plain-language explanation", async () => {
    const { actor } = createMockActor({
      matches: [
        makeMatch({
          id: 1n,
          score: 88n,
          explanation: "Same category, location, and a close description.",
        }),
      ],
    });
    core.actor = actor;

    renderAppAt("/matches");

    expect(await screen.findByText("88%")).toBeInTheDocument();
    expect(
      screen.getByText("Same category, location, and a close description."),
    ).toBeInTheDocument();
    expect(screen.getByText("confidence")).toBeInTheDocument();
  });

  it("shows an empty state when there are no matches", async () => {
    const { actor } = createMockActor({ matches: [] });
    core.actor = actor;

    renderAppAt("/matches");

    expect(await screen.findByText("No matches yet")).toBeInTheDocument();
  });
});
