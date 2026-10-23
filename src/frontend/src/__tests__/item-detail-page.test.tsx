import { ClaimStatus, ReportKind, ReportStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, makeClaim, makeReport } from "./mock-actor";
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

describe("ItemDetailPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("shows the full details, status badge, and a QR code for the report", async () => {
    const { actor } = createMockActor({
      reports: [
        makeReport({
          id: 42n,
          title: "Navy blue backpack",
          status: ReportStatus.active,
          location: "Main Library",
        }),
      ],
    });
    core.actor = actor;

    renderAppAt("/items/42");

    expect(
      await screen.findByRole("heading", { name: "Navy blue backpack" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Main Library")).toBeInTheDocument();
    // The QR card renders a canvas encoding the report's detail URL.
    expect(screen.getByTestId("qr_card")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print/i })).toBeInTheDocument();
  });

  it("does not expose the reporter's private contact details on the public page", async () => {
    const { actor } = createMockActor({
      reports: [makeReport({ id: 42n, title: "Navy blue backpack" })],
    });
    core.actor = actor;

    renderAppAt("/items/42");

    await screen.findByRole("heading", { name: "Navy blue backpack" });
    // The public report view carries no contact fields; the page must not
    // surface any email or phone even though the reporter supplied them.
    expect(screen.queryByText(/ada@example\.com/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/contact details for this report are private/i),
    ).toBeInTheDocument();
  });

  it("files a claim on a found report and forwards the proof to the backend", async () => {
    const { actor, state } = createMockActor({
      reports: [
        makeReport({
          id: 7n,
          kind: ReportKind.found,
          title: "Found leather wallet",
          status: ReportStatus.active,
        }),
      ],
    });
    state.fileClaim.mockResolvedValue({
      __kind__: "ok",
      ok: makeClaim({ id: 3n, reportId: 7n, status: ClaimStatus.pending }),
    });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/items/7");
    await user.type(await screen.findByLabelText("Your name"), "Grace Hopper");
    await user.type(screen.getByLabelText("Email"), "grace@example.com");
    await user.type(
      screen.getByLabelText("Proof of ownership"),
      "It has my initials embossed on the inside flap.",
    );
    await user.click(screen.getByRole("button", { name: /submit claim/i }));

    await waitFor(() => {
      expect(state.fileClaim).toHaveBeenCalledTimes(1);
    });
    expect(state.fileClaim.mock.calls[0][0]).toMatchObject({
      reportId: 7n,
      claimantName: "Grace Hopper",
      claimantEmail: "grace@example.com",
      proof: "It has my initials embossed on the inside flap.",
    });
  });

  it("shows a not-found state for a missing report", async () => {
    const { actor } = createMockActor({ reports: [] });
    core.actor = actor;

    renderAppAt("/items/999");

    expect(await screen.findByText("Report not found")).toBeInTheDocument();
  });
});
