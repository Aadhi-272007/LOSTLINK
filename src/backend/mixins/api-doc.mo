/// Static, human-readable documentation of the LostLink backend's public API.
/// This mixin declares no state and reads no runtime data; it returns a fixed
/// Markdown document authored from the current backend source.
mixin () {
  /// Return the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "
# LostLink Backend API

LostLink is a college Lost & Found service. Students submit Lost and Found
reports without logging in, the backend automatically suggests matches between
them, and staff review claims and issue single-use return-verification codes.
This document describes the public Candid API exposed by the backend canister.

## Authentication and identity

Most report and matching endpoints are open to anonymous callers — reporting a
lost or found item requires no login. The admin endpoints require a signed-in
caller holding the `#admin` role.

The app's frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent already holding the
user's Internet Identity authorization derives the correct per-app principal
against that origin (for example `icp identity link web <name> --app <host>`).
Such a delegation acts with the user's full authority in this app until it
expires.

### Registration prerequisite

Role-guarded calls require the caller to be registered first. Registration
happens only when a caller signs in through the app's own frontend, so a
principal that never did so is unregistered even when it belongs to the app's
owner, and a signed-in caller derived against a different origin is a different
principal than the one the frontend registered.

A direct API caller registers by calling `_initialize_access_control()` once as
a signed-in (non-anonymous) caller before any role-guarded call. The first
principal to initialize receives the `#admin` role; every subsequent caller
receives `#user`. Anonymous callers are ignored by initialization and remain
unregistered.

An unregistered or anonymous caller hitting a role-guarded endpoint receives a
trap from `getUserRole` with the message `User is not registered`. The admin
endpoints in this backend check `isAdmin`, which calls `getUserRole`; an
unregistered caller therefore traps rather than receiving an empty result.

## Units and encodings

- **Timestamps** (`Timestamp`) are milliseconds since the Unix epoch, as `Nat`.
- **Identifiers** (`ReportId`, `ClaimId`, `MatchId`, `AuditId`) are `Nat`.
- **Optional values** are Candid `opt`; absent values are `null`.
- **Variants** are Candid variants: `ReportKind` is `#lost` / `#found`;
  `ReportStatus` is `#active` / `#hidden` / `#removed` / `#returned` /
  `#withdrawn`; `ClaimStatus` is `#pending` / `#approved` / `#rejected` /
  `#disputed`; `SortOrder` is `#newest` / `#oldest` / `#relevance`.
- **Photos** are stored as platform file-storage references encoded as `Text`
  in the `photo` field; the frontend resolves them to display URLs.
- **Management codes** and **return codes** are opaque `Text` secrets. The
  backend stores only a hash of each; the plaintext is returned exactly once.

## Public methods

### Reports

- `submitReport(input : ReportInput) : Result<SubmitResult, ApiError>` —
  create a Lost or Found report without login. Returns the public report view
  plus the private `managementCode` (returned only here). Rate limited to 5
  submissions per caller per 60 seconds.
- `getReport(id : ReportId) : ?ReportView` — public report view, or `null`.
  Private contact details and the management-code hash are never included.
- `listReports(filter : ReportQuery) : ReportPage` — search, filter, sort, and
  paginate public reports.
- `listMyReports(code : ManagementCode) : [ReportView]` — reports owned by a
  management code.
- `editReport(id, code, edit) : Result<ReportView, ApiError>` — edit a report
  after verifying its management code; recomputes matches.
- `withdrawReport(id, code) : Result<(), ApiError>` — withdraw (close) a report
  after verifying its management code.

### Matching

- `listMatchesForReport(reportId) : [MatchDetail]` — suggestions for one report.
- `listMatches() : [MatchDetail]` — all suggestions.
- `getMatch(id) : ?MatchDetail` — one suggestion with both report views.

### Claims

- `fileClaim(input : ClaimInput) : Result<ClaimView, ApiError>` — file a claim
  on a found report with proof of ownership. Rate limited to 3 claims per caller
  per 60 seconds.
- `listClaimsForReport(reportId) : [ClaimView]` — claims filed against a report.
- `verifyReturnCode(code) : Result<ReturnResult, ApiError>` — validate and
  consume a single-use return-verification code.

### Admin (requires `#admin` role)

- `adminListClaims(status : ?ClaimStatus) : [ClaimView]` — claim queue.
- `adminApproveClaim(id, note) : Result<ApprovalResult, ApiError>` — approve a
  claim and issue a single-use return code.
- `adminRejectClaim(id, note) : Result<ClaimView, ApiError>` — reject a claim.
- `adminDisputeClaim(id, note) : Result<ClaimView, ApiError>` — mark disputed.
- `adminSetReportStatus(id, status) : Result<(), ApiError>` — moderate a report.
- `adminListAudit(page, pageSize) : AuditPage` — audit log, newest first.

### Authorization helpers

- `_initialize_access_control() : ()` — register the caller; first caller
  becomes `#admin`, later callers `#user`.
- `getCallerUserRole() : UserRole` — the caller's role; traps when unregistered.
- `isCallerAdmin() : Bool` — whether the caller holds `#admin`.
- `assignCallerUserRole(user, role) : ()` — admin-only role assignment.

### Data access

- `schema()` / `execute(query)` — OQL endpoints exposing the `report`, `match`,
  `claim`, and `auditEvent` tables. `report` and `match` are public; `claim` and
  `auditEvent` are controller-only.

## Lifecycle and polling

- A report starts `#active`. It becomes `#withdrawn` when the reporter withdraws
  it, `#hidden` or `#removed` through moderation, and `#returned` once a return
  code is consumed.
- A claim starts `#pending`, then moves to `#approved`, `#rejected`, or
  `#disputed`. Approval issues a return code with an expiry timestamp.
- Match suggestions are recomputed synchronously on report submission and edit;
  there is no background job to poll. Re-read `listMatchesForReport` after a
  write to observe new suggestions.

## Mutation retry safety

- `submitReport` is **not** idempotent: each successful call creates a new
  report and a new management code. Retrying after a timeout may duplicate the
  report; the rate limit bounds the damage.
- `editReport`, `withdrawReport`, `adminSetReportStatus`, and the admin claim
  actions are idempotent in effect — repeating them converges on the same state.
- `verifyReturnCode` is **single-use and destructive**: the first successful
  call marks the item returned and consumes the code. A retry returns
  `#err(#alreadyUsed)`. Do not retry blindly; treat `#alreadyUsed` as success
  only if the first call's result was lost.
- `fileClaim` is not idempotent; each call creates a new claim.

## Errors, traps, and limits

- Fallible methods return `Result<Ok, ApiError>` where `ApiError` is
  `#notFound`, `#notAuthorized`, `#invalidInput(Text)`, `#rateLimited`,
  `#conflict(Text)`, `#expired`, or `#alreadyUsed`.
- `getCallerUserRole` and `isCallerAdmin` trap with `User is not registered`
  for an unregistered non-anonymous caller.
- `assignCallerUserRole` traps with
  `Unauthorized: Only admins can assign user roles` for a non-admin caller.
- Input validation is enforced server-side: titles 3-120 characters,
  descriptions 10-2000 characters, non-empty category and location, a contact
  name, and an email containing `@`. Claims require a name of at least 2
  characters, a valid email, and proof of at least 10 characters.
- Rate limits: 5 report submissions and 3 claims per caller per 60 seconds.
- Private contact details are never returned by public listing or detail
  methods; they are only reachable through an approved claim's review flow.
";
  };
};
