import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ApiError = {
    __kind__: "alreadyUsed";
    alreadyUsed: null;
} | {
    __kind__: "conflict";
    conflict: string;
} | {
    __kind__: "expired";
    expired: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "rateLimited";
    rateLimited: null;
};
export interface ApprovalResult {
    expiresAt: Timestamp;
    claim: ClaimView;
    returnCode: ReturnCode;
}
export interface AuditEvent {
    id: AuditId;
    action: string;
    subject: string;
    createdAt: Timestamp;
    detail: string;
    actorPrincipal: string;
}
export type AuditId = bigint;
export interface AuditPage {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<AuditEvent>;
}
export interface Cell {
    value: Value;
    name: string;
}
export type ClaimId = bigint;
export interface ClaimInput {
    claimantEmail: string;
    claimantName: string;
    claimantPhone?: string;
    proof: string;
    reportId: ReportId;
}
export interface ClaimView {
    id: ClaimId;
    status: ClaimStatus;
    claimantName: string;
    createdAt: Timestamp;
    reviewNote?: string;
    updatedAt: Timestamp;
    reportId: ReportId;
}
export interface ContactInfo {
    name: string;
    email: string;
    phone?: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type ManagementCode = string;
export interface MatchDetail {
    id: MatchId;
    found: ReportView;
    lost: ReportView;
    explanation: string;
    createdAt: Timestamp;
    score: bigint;
}
export type MatchId = bigint;
export interface ReportEdit {
    title: string;
    contact: ContactInfo;
    holdingLocation?: string;
    description: string;
    occurredAt: Timestamp;
    category: string;
    photo?: string;
    location: string;
}
export type ReportId = bigint;
export interface ReportInput {
    title: string;
    contact: ContactInfo;
    holdingLocation?: string;
    kind: ReportKind;
    description: string;
    occurredAt: Timestamp;
    category: string;
    photo?: string;
    location: string;
}
export interface ReportPage {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<ReportView>;
}
export interface ReportQuery {
    kind?: ReportKind;
    page: bigint;
    sort: SortOrder;
    pageSize: bigint;
    search?: string;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    category?: string;
    location?: string;
}
export interface ReportView {
    id: ReportId;
    status: ReportStatus;
    title: string;
    holdingLocation?: string;
    kind: ReportKind;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    occurredAt: Timestamp;
    category: string;
    photo?: string;
    location: string;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: ReturnResult;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: SubmitResult;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: ClaimView;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: ReportView;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_5 = {
    __kind__: "ok";
    ok: ApprovalResult;
} | {
    __kind__: "err";
    err: ApiError;
};
export type Result_6 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type ReturnCode = string;
export interface ReturnResult {
    claimId: ClaimId;
    reportId: ReportId;
    returnedAt: Timestamp;
}
export interface SubmitResult {
    report: ReportView;
    managementCode: ManagementCode;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ClaimStatus {
    disputed = "disputed",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ReportKind {
    found = "found",
    lost = "lost"
}
export enum ReportStatus {
    active = "active",
    hidden = "hidden",
    withdrawn = "withdrawn",
    returned = "returned",
    removed = "removed"
}
export enum SortOrder {
    newest = "newest",
    relevance = "relevance",
    oldest = "oldest"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Approve a claim, issuing a single-use return code.
     */
    adminApproveClaim(id: ClaimId, note: string | null): Promise<Result_5>;
    /**
     * / Mark a claim as disputed.
     */
    adminDisputeClaim(id: ClaimId, note: string | null): Promise<Result_3>;
    /**
     * / List audit events, newest first.
     */
    adminListAudit(page: bigint, pageSize: bigint): Promise<AuditPage>;
    /**
     * / List all claims for the admin claim queue.
     */
    adminListClaims(status: ClaimStatus | null): Promise<Array<ClaimView>>;
    /**
     * / Reject a claim.
     */
    adminRejectClaim(id: ClaimId, note: string | null): Promise<Result_3>;
    /**
     * / Set a report's moderation status.
     */
    adminSetReportStatus(id: ReportId, status: ReportStatus): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Edit a report after verifying its management code.
     */
    editReport(id: ReportId, code: ManagementCode, edit: ReportEdit): Promise<Result_4>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / File a claim on a found report with proof of ownership.
     */
    fileClaim(input: ClaimInput): Promise<Result_3>;
    /**
     * / Return the backend API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a single match detail by id.
     */
    getMatch(id: MatchId): Promise<MatchDetail | null>;
    /**
     * / Fetch a public report view by id.
     */
    getReport(id: ReportId): Promise<ReportView | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List claims filed against a report.
     */
    listClaimsForReport(reportId: ReportId): Promise<Array<ClaimView>>;
    /**
     * / List all match suggestions.
     */
    listMatches(): Promise<Array<MatchDetail>>;
    /**
     * / List match suggestions for a report.
     */
    listMatchesForReport(reportId: ReportId): Promise<Array<MatchDetail>>;
    /**
     * / List reports owned by a management code.
     */
    listMyReports(code: ManagementCode): Promise<Array<ReportView>>;
    /**
     * / List reports with search, filters, sorting, and pagination.
     */
    listReports(filter: ReportQuery): Promise<ReportPage>;
    schema(): Promise<string>;
    /**
     * / Submit a Lost or Found report without login.
     */
    submitReport(input: ReportInput): Promise<Result_2>;
    /**
     * / Validate and consume a single-use return-verification code.
     */
    verifyReturnCode(code: ReturnCode): Promise<Result_1>;
    /**
     * / Withdraw (close) a report after verifying its management code.
     */
    withdrawReport(id: ReportId, code: ManagementCode): Promise<Result>;
}
