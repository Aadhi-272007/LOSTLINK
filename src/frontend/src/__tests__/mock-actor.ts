import type {
  AuditPage,
  ClaimStatus,
  ClaimView,
  MatchDetail,
  ReportPage,
  ReportQuery,
  ReportView,
  Result,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  SubmitResult,
  backendInterface,
} from "@/backend";
import { ClaimStatus as ClaimStatusEnum, ReportStatus } from "@/backend";
import { vi } from "vitest";

/**
 * A typed, in-memory stand-in for the generated backend actor. Every method the
 * app's hooks call is present, so a test can drive real component behaviour
 * without a replica. It is deliberately a mock: it proves nothing about the
 * canister, only about how the frontend consumes the actor's contract.
 */
export type MockActor = backendInterface;

export interface MockActorState {
  reports: ReportView[];
  matches: MatchDetail[];
  claims: ClaimView[];
  audit: AuditPage;
  isAdmin: boolean;
  /** Records every `listReports` query the UI issued, for URL/state assertions. */
  listReportsCalls: ReportQuery[];
  submitReport: ReturnType<typeof vi.fn>;
  editReport: ReturnType<typeof vi.fn>;
  withdrawReport: ReturnType<typeof vi.fn>;
  fileClaim: ReturnType<typeof vi.fn>;
  verifyReturnCode: ReturnType<typeof vi.fn>;
  adminApproveClaim: ReturnType<typeof vi.fn>;
  adminRejectClaim: ReturnType<typeof vi.fn>;
  adminDisputeClaim: ReturnType<typeof vi.fn>;
  adminSetReportStatus: ReturnType<typeof vi.fn>;
}

export function makeReport(overrides: Partial<ReportView> = {}): ReportView {
  return {
    id: 1n,
    status: ReportStatus.active,
    title: "Navy blue backpack",
    holdingLocation: undefined,
    kind: "lost" as ReportView["kind"],
    createdAt: 1_700_000_000_000_000_000n,
    description: "A navy backpack with a laptop sleeve and a red keyring.",
    updatedAt: 1_700_000_000_000_000_000n,
    occurredAt: 1_700_000_000_000_000_000n,
    category: "Bag",
    photo: undefined,
    location: "Main Library",
    ...overrides,
  };
}

export function makeClaim(overrides: Partial<ClaimView> = {}): ClaimView {
  return {
    id: 1n,
    status: ClaimStatusEnum.pending,
    claimantName: "Ada Lovelace",
    createdAt: 1_700_000_000_000_000_000n,
    reviewNote: undefined,
    updatedAt: 1_700_000_000_000_000_000n,
    reportId: 1n,
    ...overrides,
  };
}

export function makeMatch(overrides: Partial<MatchDetail> = {}): MatchDetail {
  return {
    id: 1n,
    found: makeReport({ id: 2n, kind: "found" as ReportView["kind"] }),
    lost: makeReport({ id: 1n }),
    explanation: "Same category, location, and a close description.",
    createdAt: 1_700_000_000_000_000_000n,
    score: 88n,
    ...overrides,
  };
}

/**
 * Build a mock actor whose reads return the supplied state and whose writes are
 * `vi.fn`s a test can assert on or override per case.
 */
export function createMockActor(state: Partial<MockActorState> = {}): {
  actor: MockActor;
  state: MockActorState;
} {
  const resolved: MockActorState = {
    reports: [],
    matches: [],
    claims: [],
    audit: { total: 0n, page: 1n, pageSize: 20n, items: [] },
    isAdmin: false,
    listReportsCalls: [],
    submitReport: vi.fn(),
    editReport: vi.fn(),
    withdrawReport: vi.fn(),
    fileClaim: vi.fn(),
    verifyReturnCode: vi.fn(),
    adminApproveClaim: vi.fn(),
    adminRejectClaim: vi.fn(),
    adminDisputeClaim: vi.fn(),
    adminSetReportStatus: vi.fn(),
    ...state,
  };

  const actor: MockActor = {
    // Platform object-storage infrastructure methods. The app never calls these
    // directly (uploads go through the storage gateway), so they are inert
    // stubs that satisfy the generated interface.
    _immutableObjectStorageBlobsAreLive: vi.fn(async (hashes: Uint8Array[]) =>
      hashes.map(() => true),
    ),
    _immutableObjectStorageBlobsToDelete: vi.fn(async () => []),
    _immutableObjectStorageConfirmBlobDeletion: vi.fn(async () => undefined),
    _immutableObjectStorageCreateCertificate: vi.fn(
      async (blobHash: string) => ({
        method: "PUT",
        blob_hash: blobHash,
      }),
    ),
    _immutableObjectStorageRefillCashier: vi.fn(async () => ({
      success: true,
      topped_up_amount: 0n,
    })),
    _immutableObjectStorageUpdateGatewayPrincipals: vi.fn(
      async () => undefined,
    ),
    _initialize_access_control: vi.fn(async () => undefined),
    _internet_identity_sign_in_finish: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: null,
    })),
    _internet_identity_sign_in_start: vi.fn(async () => new Uint8Array()),
    adminApproveClaim: resolved.adminApproveClaim as unknown as (
      id: bigint,
      note: string | null,
    ) => Promise<Result_5>,
    adminDisputeClaim: resolved.adminDisputeClaim as unknown as (
      id: bigint,
      note: string | null,
    ) => Promise<Result_3>,
    adminListAudit: vi.fn(async () => resolved.audit),
    adminListClaims: vi.fn(async (status: ClaimStatus | null) =>
      status === null
        ? resolved.claims
        : resolved.claims.filter((claim) => claim.status === status),
    ),
    adminRejectClaim: resolved.adminRejectClaim as unknown as (
      id: bigint,
      note: string | null,
    ) => Promise<Result_3>,
    adminSetReportStatus: resolved.adminSetReportStatus as unknown as (
      id: bigint,
      status: ReportStatus,
    ) => Promise<Result>,
    assignCallerUserRole: vi.fn(async () => undefined),
    editReport: resolved.editReport as unknown as (
      id: bigint,
      code: string,
      edit: unknown,
    ) => Promise<Result_4>,
    execute: vi.fn(async () => ({ hasMore: false, rows: [] })),
    fileClaim: resolved.fileClaim as unknown as (
      input: unknown,
    ) => Promise<Result_3>,
    getApiDoc: vi.fn(async () => "# LostLink API"),
    getCallerUserRole: vi.fn(async () => "guest" as never),
    getMatch: vi.fn(
      async (id: bigint) => resolved.matches.find((m) => m.id === id) ?? null,
    ),
    getReport: vi.fn(
      async (id: bigint) => resolved.reports.find((r) => r.id === id) ?? null,
    ),
    isCallerAdmin: vi.fn(async () => resolved.isAdmin),
    listClaimsForReport: vi.fn(async (reportId: bigint) =>
      resolved.claims.filter((claim) => claim.reportId === reportId),
    ),
    listMatches: vi.fn(async () => resolved.matches),
    listMatchesForReport: vi.fn(async (reportId: bigint) =>
      resolved.matches.filter(
        (match) => match.lost.id === reportId || match.found.id === reportId,
      ),
    ),
    listMyReports: vi.fn(async (code: string) =>
      code === "VALID-CODE" ? resolved.reports : [],
    ),
    listReports: vi.fn(async (query: ReportQuery) => {
      resolved.listReportsCalls.push(query);
      const items = resolved.reports.filter((report) => {
        if (query.kind !== undefined && report.kind !== query.kind)
          return false;
        if (query.category !== undefined && report.category !== query.category)
          return false;
        if (query.location !== undefined && report.location !== query.location)
          return false;
        if (query.search !== undefined) {
          const needle = query.search.toLowerCase();
          if (
            !report.title.toLowerCase().includes(needle) &&
            !report.description.toLowerCase().includes(needle)
          ) {
            return false;
          }
        }
        return true;
      });
      const page: ReportPage = {
        total: BigInt(items.length),
        page: query.page,
        pageSize: query.pageSize,
        items,
      };
      return page;
    }),
    schema: vi.fn(async () => "{}"),
    submitReport: resolved.submitReport as unknown as (
      input: unknown,
    ) => Promise<Result_2>,
    verifyReturnCode: resolved.verifyReturnCode as unknown as (
      code: string,
    ) => Promise<Result_1>,
    withdrawReport: resolved.withdrawReport as unknown as (
      id: bigint,
      code: string,
    ) => Promise<Result>,
  };

  return { actor, state: resolved };
}

/** A successful `submitReport` result with a private management code. */
export function submitOk(
  report: ReportView,
  managementCode = "PRIVATE-CODE-123",
): Result_2 {
  const ok: SubmitResult = { report, managementCode };
  return { __kind__: "ok", ok };
}
