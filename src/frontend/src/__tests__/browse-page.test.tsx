import { ReportKind, SortOrder } from "@/backend";
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

describe("BrowsePage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("lists reports returned by the backend for the requested kind", async () => {
    const { actor, state } = createMockActor({
      reports: [
        makeReport({ id: 1n, kind: ReportKind.lost, title: "Lost umbrella" }),
        makeReport({ id: 2n, kind: ReportKind.found, title: "Found umbrella" }),
      ],
    });
    core.actor = actor;

    renderAppAt("/lost");

    expect(await screen.findByText("Lost umbrella")).toBeInTheDocument();
    expect(screen.queryByText("Found umbrella")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(state.listReportsCalls.at(-1)).toMatchObject({
        kind: ReportKind.lost,
      });
    });
  });

  it("reflects a search term in the URL and forwards it to the backend", async () => {
    const { actor, state } = createMockActor({
      reports: [makeReport({ id: 1n, title: "Silver water bottle" })],
    });
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/lost");
    await user.type(await screen.findByLabelText("Search"), "bottle");

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: "bottle" });
    });
    await waitFor(() => {
      expect(state.listReportsCalls.at(-1)).toMatchObject({ search: "bottle" });
    });
  });

  it("reflects a sort change in the URL and forwards it to the backend", async () => {
    const { actor, state } = createMockActor({
      reports: [makeReport({ id: 1n })],
    });
    core.actor = actor;
    const user = userEvent.setup();

    const { router } = renderAppAt("/lost");
    await user.click(await screen.findByLabelText("Sort by"));
    await user.click(
      await screen.findByRole("option", { name: "Oldest first" }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        sort: SortOrder.oldest,
      });
    });
    await waitFor(() => {
      expect(state.listReportsCalls.at(-1)).toMatchObject({
        sort: SortOrder.oldest,
      });
    });
  });

  it("restores filters from the URL on a fresh load", async () => {
    const { actor, state } = createMockActor({
      reports: [makeReport({ id: 1n, title: "Silver water bottle" })],
    });
    core.actor = actor;

    renderAppAt("/lost?q=bottle&category=Water%20Bottle&page=2");

    await waitFor(() => {
      expect(state.listReportsCalls.at(-1)).toMatchObject({
        search: "bottle",
        category: "Water Bottle",
        page: 2n,
      });
    });
  });

  it("shows the filtered empty state when nothing matches", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;

    renderAppAt("/lost?q=nothing");

    expect(
      await screen.findByText(/no items match your filters/i),
    ).toBeInTheDocument();
  });
});
