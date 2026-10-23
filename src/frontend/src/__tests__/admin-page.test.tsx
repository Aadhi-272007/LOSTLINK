import { ClaimStatus, ReportStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, makeClaim, makeReport } from "./mock-actor";
import { renderAppAt } from "./render-app";

const core = vi.hoisted(() => ({
  actor: null as unknown,
  isFetching: false,
  isAuthenticated: false,
  login: vi.fn(),
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

describe("AdminPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
    core.isAuthenticated = false;
    core.login.mockReset();
  });

  it("blocks the dashboard behind staff sign-in when unauthenticated", async () => {
    const { actor } = createMockActor({ isAdmin: false });
    core.actor = actor;

    renderAppAt("/admin");

    expect(
      await screen.findByText("Staff sign-in required"),
    ).toBeInTheDocument();
    // The moderation/claims/audit views are not reachable before sign-in.
    expect(
      screen.queryByRole("tab", { name: /claims/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /audit log/i }),
    ).not.toBeInTheDocument();
  });

  it("denies a signed-in non-admin account", async () => {
    const { actor } = createMockActor({ isAdmin: false });
    core.actor = actor;
    core.isAuthenticated = true;

    renderAppAt("/admin");

    expect(
      await screen.findByText("You don't have admin access"),
    ).toBeInTheDocument();
  });

  it("exposes the claims, moderation, and audit views to an admin", async () => {
    const { actor } = createMockActor({
      isAdmin: true,
      claims: [
        makeClaim({
          id: 1n,
          reportId: 9n,
          claimantName: "Grace Hopper",
          status: ClaimStatus.pending,
        }),
      ],
      reports: [makeReport({ id: 9n, title: "Found leather wallet" })],
      audit: {
        total: 1n,
        page: 1n,
        pageSize: 20n,
        items: [
          {
            id: 1n,
            action: "claim.approve",
            subject: "claim#1",
            detail: "Verified",
            createdAt: 1_700_000_000_000_000_000n,
            actorPrincipal: "aaaaa-aa",
          },
        ],
      },
    });
    core.actor = actor;
    core.isAuthenticated = true;
    const user = userEvent.setup();

    renderAppAt("/admin");

    expect(await screen.findByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /reports/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /audit log/i })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /audit log/i }));
    expect(await screen.findByText("claim.approve")).toBeInTheDocument();
  });

  it("approves a pending claim and surfaces the issued return code", async () => {
    const { actor, state } = createMockActor({
      isAdmin: true,
      claims: [
        makeClaim({
          id: 1n,
          reportId: 9n,
          claimantName: "Grace Hopper",
          status: ClaimStatus.pending,
        }),
      ],
    });
    state.adminApproveClaim.mockResolvedValue({
      __kind__: "ok",
      ok: {
        claim: makeClaim({ id: 1n, status: ClaimStatus.approved }),
        returnCode: "RETURN-CODE-9",
        expiresAt: 1_800_000_000_000_000_000n,
      },
    });
    core.actor = actor;
    core.isAuthenticated = true;
    const user = userEvent.setup();

    renderAppAt("/admin");
    await screen.findByText("Grace Hopper");
    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() => {
      expect(state.adminApproveClaim).toHaveBeenCalledTimes(1);
    });
    expect(state.adminApproveClaim.mock.calls[0][0]).toBe(1n);
    expect(
      await screen.findByText(/return code issued: RETURN-CODE-9/i),
    ).toBeInTheDocument();
  });

  it("moderates a report by setting its status", async () => {
    const { actor, state } = createMockActor({
      isAdmin: true,
      reports: [
        makeReport({
          id: 9n,
          title: "Found leather wallet",
          status: ReportStatus.active,
        }),
      ],
    });
    state.adminSetReportStatus.mockResolvedValue({ __kind__: "ok", ok: null });
    core.actor = actor;
    core.isAuthenticated = true;
    const user = userEvent.setup();

    renderAppAt("/admin");
    await user.click(await screen.findByRole("tab", { name: /reports/i }));
    await screen.findByText("Found leather wallet");

    await user.click(screen.getByTestId("admin.status_select"));
    await user.click(await screen.findByRole("option", { name: "hidden" }));

    await waitFor(() => {
      expect(state.adminSetReportStatus).toHaveBeenCalledTimes(1);
    });
    expect(state.adminSetReportStatus.mock.calls[0]).toEqual([
      9n,
      ReportStatus.hidden,
    ]);
  });
});
