import { ReportKind } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockActor, makeReport, submitOk } from "./mock-actor";
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

// The photo path goes through the platform storage gateway; stub it so the
// test exercises the form's upload wiring without any network call.
const uploadPhoto = vi.hoisted(() => vi.fn());
vi.mock("@/lib/upload", () => ({ uploadPhoto }));

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Title"), "Navy blue backpack");
  await user.type(
    screen.getByLabelText("Description"),
    "A navy backpack with a laptop sleeve and a red keyring.",
  );
  await user.click(screen.getByLabelText("Category"));
  await user.click(await screen.findByRole("option", { name: "Bag" }));
  await user.click(screen.getByLabelText("Last seen at"));
  await user.click(await screen.findByRole("option", { name: "Main Library" }));
  await user.type(screen.getByLabelText("Date lost"), "2026-03-01");
  await user.type(screen.getByLabelText("Your name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
}

describe("ReportPage", () => {
  beforeEach(() => {
    core.actor = null;
    core.isFetching = false;
    uploadPhoto.mockReset();
  });

  it("submits a lost report without login and shows the private management code", async () => {
    const report = makeReport({ id: 42n, title: "Navy blue backpack" });
    const { actor, state } = createMockActor();
    state.submitReport.mockResolvedValue(submitOk(report, "PRIVATE-CODE-123"));
    core.actor = actor;

    renderAppAt("/report?kind=lost");
    const user = userEvent.setup();
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /submit report/i }));

    expect(await screen.findByText("Report submitted")).toBeInTheDocument();
    expect(screen.getByText("PRIVATE-CODE-123")).toBeInTheDocument();
    expect(state.submitReport).toHaveBeenCalledTimes(1);
    expect(state.submitReport.mock.calls[0][0]).toMatchObject({
      kind: ReportKind.lost,
      title: "Navy blue backpack",
      category: "Bag",
      location: "Main Library",
      contact: { name: "Ada Lovelace", email: "ada@example.com" },
    });
  });

  it("uploads a photo and passes its URL to the backend", async () => {
    const report = makeReport({ id: 7n, title: "Found keys" });
    const { actor, state } = createMockActor();
    state.submitReport.mockResolvedValue(submitOk(report, "CODE-7"));
    uploadPhoto.mockResolvedValue("https://storage.example/photo.png");
    core.actor = actor;

    renderAppAt("/report?kind=found");
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Title"), "Found keys");
    await user.type(
      screen.getByLabelText("Description"),
      "A set of keys with a green tag on a lanyard.",
    );
    await user.click(screen.getByLabelText("Category"));
    await user.click(await screen.findByRole("option", { name: "Keys" }));
    await user.click(screen.getByLabelText("Found at"));
    await user.click(
      await screen.findByRole("option", { name: "Student Union" }),
    );
    await user.type(screen.getByLabelText("Date found"), "2026-03-02");
    await user.type(screen.getByLabelText("Your name"), "Grace Hopper");
    await user.type(screen.getByLabelText("Email"), "grace@example.com");

    const file = new File(["fake-bytes"], "keys.png", { type: "image/png" });
    await user.upload(screen.getByTestId("report.photo_input"), file);

    await user.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() => {
      expect(uploadPhoto).toHaveBeenCalledTimes(1);
    });
    expect(state.submitReport.mock.calls[0][0]).toMatchObject({
      kind: ReportKind.found,
      photo: "https://storage.example/photo.png",
    });
  });

  it("blocks submission and shows field errors when required details are missing", async () => {
    const { actor, state } = createMockActor();
    core.actor = actor;

    renderAppAt("/report?kind=lost");
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: /submit report/i }),
    );

    expect(
      await screen.findByText(/give your report a short, clear title/i),
    ).toBeInTheDocument();
    expect(state.submitReport).not.toHaveBeenCalled();
  });
});
