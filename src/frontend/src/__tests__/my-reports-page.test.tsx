import { ReportStatus } from "@/backend";
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

describe("MyReportsPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("lists the reports owned by the entered management code", async () => {
    const { actor } = createMockActor({
      reports: [makeReport({ id: 5n, title: "Lost red scarf" })],
    });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/my-reports");
    await user.type(
      await screen.findByLabelText("Management code"),
      "VALID-CODE",
    );
    await user.click(screen.getByRole("button", { name: /view my reports/i }));

    expect(await screen.findByText("Lost red scarf")).toBeInTheDocument();
  });

  it("shows an empty state when the code matches no reports", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/my-reports");
    await user.type(
      await screen.findByLabelText("Management code"),
      "WRONG-CODE",
    );
    await user.click(screen.getByRole("button", { name: /view my reports/i }));

    expect(
      await screen.findByText(/no reports found for that code/i),
    ).toBeInTheDocument();
  });

  it("withdraws a report after confirming, passing the management code", async () => {
    const { actor, state } = createMockActor({
      reports: [
        makeReport({
          id: 5n,
          title: "Lost red scarf",
          status: ReportStatus.active,
        }),
      ],
    });
    state.withdrawReport.mockResolvedValue({ __kind__: "ok", ok: null });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/my-reports");
    await user.type(
      await screen.findByLabelText("Management code"),
      "VALID-CODE",
    );
    await user.click(screen.getByRole("button", { name: /view my reports/i }));
    await screen.findByText("Lost red scarf");

    await user.click(screen.getByRole("button", { name: /^withdraw$/i }));
    await user.click(
      await screen.findByRole("button", { name: /withdraw report/i }),
    );

    await waitFor(() => {
      expect(state.withdrawReport).toHaveBeenCalledTimes(1);
    });
    expect(state.withdrawReport.mock.calls[0]).toEqual([5n, "VALID-CODE"]);
  });
});
