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

describe("ReturnVerifyPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
  });

  it("verifies a valid return code and marks the report returned", async () => {
    const { actor, state } = createMockActor();
    state.verifyReturnCode.mockResolvedValue({
      __kind__: "ok",
      ok: {
        claimId: 1n,
        reportId: 9n,
        returnedAt: 1_700_000_000_000_000_000n,
      },
    });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/return-verify");
    await user.type(
      await screen.findByLabelText("Return code"),
      "RETURN-CODE-9",
    );
    await user.click(
      screen.getByRole("button", { name: /verify and mark returned/i }),
    );

    expect(await screen.findByText("Return verified")).toBeInTheDocument();
    expect(
      screen.getByText(/report #9 was marked returned/i),
    ).toBeInTheDocument();
    expect(state.verifyReturnCode).toHaveBeenCalledWith("RETURN-CODE-9");
  });

  it("surfaces the rejection when a spent code is reused", async () => {
    const { actor, state } = createMockActor();
    state.verifyReturnCode.mockResolvedValue({
      __kind__: "err",
      err: { __kind__: "alreadyUsed", alreadyUsed: null },
    });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/return-verify");
    await user.type(
      await screen.findByLabelText("Return code"),
      "RETURN-CODE-9",
    );
    await user.click(
      screen.getByRole("button", { name: /verify and mark returned/i }),
    );

    expect(await screen.findByText("Code not accepted")).toBeInTheDocument();
    expect(
      screen.getByText(/this code has already been used/i),
    ).toBeInTheDocument();
  });

  it("surfaces the rejection when a code has expired", async () => {
    const { actor, state } = createMockActor();
    state.verifyReturnCode.mockResolvedValue({
      __kind__: "err",
      err: { __kind__: "expired", expired: null },
    });
    core.actor = actor;
    const user = userEvent.setup();

    renderAppAt("/return-verify");
    await user.type(
      await screen.findByLabelText("Return code"),
      "EXPIRED-CODE",
    );
    await user.click(
      screen.getByRole("button", { name: /verify and mark returned/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Code not accepted")).toBeInTheDocument();
    });
    expect(screen.getByText(/this code has expired/i)).toBeInTheDocument();
  });
});
