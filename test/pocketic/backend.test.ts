import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type {
  ReportInput,
  ReportKind,
  _SERVICE,
} from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** A valid report payload; `kind` and `title` are overridden per case. */
function reportInput(overrides: {
  kind: ReportKind;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  photo?: string;
}): ReportInput {
  return {
    kind: overrides.kind,
    title: overrides.title,
    description:
      overrides.description ??
      "A distinctive item with a unique identifying mark for matching.",
    category: overrides.category ?? "Bag",
    location: overrides.location ?? "Main Library",
    holdingLocation: [],
    occurredAt: 1_700_000_000_000n,
    photo: overrides.photo === undefined ? [] : [overrides.photo],
    contact: { name: "Ada Lovelace", email: "ada@example.com", phone: [] },
  };
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

/**
 * Each test acts as its own caller. The backend rate-limits submissions to 5
 * per caller per 60 seconds, so sharing one identity across tests would make
 * later tests fail on the limit rather than on the behavior under test.
 */
function actAs(seed: string) {
  actor.setIdentity(createIdentity(seed));
}

it("answers empty-state reads instead of trapping", async () => {
  actAs("empty-state");
  const page = await actor.listReports({
    kind: [],
    page: 0n,
    sort: { newest: null },
    pageSize: 12n,
    search: [],
    toDate: [],
    fromDate: [],
    category: [],
    location: [],
  });
  expect(page.total).toBe(0n);
  expect(page.items).toEqual([]);
  expect(await actor.listMatches()).toEqual([]);
  expect(await actor.getReport(999n)).toEqual([]);
});

it("round-trips a lost report through the real canister", async () => {
  actAs("lost-round-trip");
  const result = await actor.submitReport(
    reportInput({ kind: { lost: null }, title: "Navy blue backpack" }),
  );
  expect(result).toHaveProperty("ok");
  if (!("ok" in result)) throw new Error("expected ok");
  const { report, managementCode } = result.ok;
  expect(report.title).toBe("Navy blue backpack");
  expect(report.status).toEqual({ active: null });
  expect(managementCode.length).toBeGreaterThan(0);

  const fetched = await actor.getReport(report.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]?.title).toBe("Navy blue backpack");
});

it("persists a found report's photo and returns it on the detail read", async () => {
  actAs("found-photo");
  const result = await actor.submitReport(
    reportInput({
      kind: { found: null },
      title: "Found green umbrella",
      photo: "https://storage.example/umbrella.png",
    }),
  );
  if (!("ok" in result)) throw new Error("expected ok");
  const fetched = await actor.getReport(result.ok.report.id);
  expect(fetched[0]?.photo).toEqual(["https://storage.example/umbrella.png"]);
});

it("suggests a match with a score and explanation for matching lost and found reports", async () => {
  actAs("matching");
  const lost = await actor.submitReport(
    reportInput({
      kind: { lost: null },
      title: "Silver water bottle",
      description: "A silver insulated water bottle with a dented cap.",
      category: "Water Bottle",
      location: "Student Union",
    }),
  );
  const found = await actor.submitReport(
    reportInput({
      kind: { found: null },
      title: "Silver water bottle",
      description: "A silver insulated water bottle with a dented cap.",
      category: "Water Bottle",
      location: "Student Union",
    }),
  );
  if (!("ok" in lost) || !("ok" in found)) throw new Error("expected ok");

  const matches = await actor.listMatchesForReport(lost.ok.report.id);
  expect(matches.length).toBeGreaterThan(0);
  const match = matches[0];
  expect(match?.score).toBeGreaterThanOrEqual(40n);
  expect(match?.explanation.length).toBeGreaterThan(0);
  expect(match?.found.id).toBe(found.ok.report.id);
});

it("files a claim on a found report and issues a single-use return code on approval", async () => {
  actAs("claimant");
  const found = await actor.submitReport(
    reportInput({ kind: { found: null }, title: "Found leather wallet" }),
  );
  if (!("ok" in found)) throw new Error("expected ok");
  const reportId = found.ok.report.id;

  const claim = await actor.fileClaim({
    reportId,
    claimantName: "Grace Hopper",
    claimantEmail: "grace@example.com",
    claimantPhone: [],
    proof: "It has my initials embossed on the inside flap.",
  });
  if (!("ok" in claim)) throw new Error("expected ok");
  expect(claim.ok.status).toEqual({ pending: null });

  // A non-admin caller cannot see or act on the claim queue.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  expect(await guest.adminListClaims([])).toEqual([]);
  const denied = await guest.adminApproveClaim(claim.ok.id, []);
  expect(denied).toEqual({ err: { notAuthorized: null } });

  // The first registered caller becomes admin.
  const admin = createIdentity("admin");
  actor.setIdentity(admin);
  await actor._initialize_access_control();
  expect(await actor.isCallerAdmin()).toBe(true);

  const approved = await actor.adminApproveClaim(claim.ok.id, ["Verified"]);
  if (!("ok" in approved)) throw new Error("expected ok");
  const code = approved.ok.returnCode;
  expect(code.length).toBeGreaterThan(0);

  const first = await actor.verifyReturnCode(code);
  expect(first).toHaveProperty("ok");
  if (!("ok" in first)) throw new Error("expected ok");
  expect(first.ok.reportId).toBe(reportId);

  // The code is single-use: a second attempt is rejected.
  const second = await actor.verifyReturnCode(code);
  expect(second).toEqual({ err: { alreadyUsed: null } });

  // Consuming the code marks the report returned.
  const returned = await actor.getReport(reportId);
  expect(returned[0]?.status).toEqual({ returned: null });
});

it("lists, edits, and withdraws a report through its management code", async () => {
  actAs("my-reports");
  const submitted = await actor.submitReport(
    reportInput({ kind: { lost: null }, title: "Lost red scarf" }),
  );
  if (!("ok" in submitted)) throw new Error("expected ok");
  const { report, managementCode } = submitted.ok;

  const mine = await actor.listMyReports(managementCode);
  expect(mine.map((r) => r.id)).toContain(report.id);

  const edited = await actor.editReport(report.id, managementCode, {
    title: "Lost red wool scarf",
    description: "A red wool scarf with a small moth hole near the fringe.",
    category: "Clothing",
    location: "Main Library",
    holdingLocation: [],
    occurredAt: 1_700_000_000_000n,
    photo: [],
    contact: { name: "Ada Lovelace", email: "ada@example.com", phone: [] },
  });
  if (!("ok" in edited)) throw new Error("expected ok");
  expect(edited.ok.title).toBe("Lost red wool scarf");

  const withdrawn = await actor.withdrawReport(report.id, managementCode);
  expect(withdrawn).toEqual({ ok: null });
  const after = await actor.getReport(report.id);
  expect(after[0]?.status).toEqual({ withdrawn: null });

  // A wrong management code cannot edit or withdraw.
  const wrong = await actor.withdrawReport(report.id, "LL-not-the-code");
  expect(wrong).toEqual({ err: { notAuthorized: null } });
});
