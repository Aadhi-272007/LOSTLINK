import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/claims";
import Reports "../types/reports";
import ReportsLib "reports";
import Common "../types/common";

module {
  public type Claim = Types.Claim;
  public type ClaimView = Types.ClaimView;
  public type ClaimInput = Types.ClaimInput;
  public type ApprovalResult = Types.ApprovalResult;
  public type ReturnResult = Types.ReturnResult;

  /// Return codes are valid for 72 hours.
  let returnCodeTtl : Nat = 259200000;

  /// Convert an internal claim to its public projection.
  public func toView(claim : Claim) : ClaimView {
    {
      id = claim.id;
      reportId = claim.reportId;
      claimantName = claim.claimantName;
      status = claim.status;
      reviewNote = claim.reviewNote;
      createdAt = claim.createdAt;
      updatedAt = claim.updatedAt;
    };
  };

  func newReturnCode(seed : Nat) : Text {
    let now = Common.now();
    let mixed = (seed * 2654435761 + now * 40503 + 98765) % 4294967291;
    let second = (mixed * 1103515245 + 12345) % 4294967291;
    "RV-" # mixed.toText() # "-" # second.toText();
  };

  /// File a claim against a found report.
  public func create(
    claims : Map.Map<Common.ClaimId, Claim>,
    state : { var nextClaimId : Nat },
    reports : Map.Map<Common.ReportId, Reports.Report>,
    input : ClaimInput,
  ) : ?ClaimView {
    switch (reports.get(input.reportId)) {
      case (?report) {
        if (report.kind != #found or report.status != #active) { return null };
        let id = state.nextClaimId;
        state.nextClaimId := id + 1;
        let now = Common.now();
        let claim : Claim = {
          id;
          reportId = input.reportId;
          claimantName = input.claimantName;
          claimantEmail = input.claimantEmail;
          claimantPhone = input.claimantPhone;
          proof = input.proof;
          status = #pending;
          reviewNote = null;
          returnCodeHash = null;
          returnCodeExpiresAt = null;
          returnCodeUsed = false;
          createdAt = now;
          updatedAt = now;
        };
        claims.add(id, claim);
        ?toView(claim);
      };
      case null { null };
    };
  };

  /// List claims, optionally filtered by status.
  public func list(
    claims : Map.Map<Common.ClaimId, Claim>,
    status : ?Common.ClaimStatus,
  ) : [ClaimView] {
    let out = List.empty<ClaimView>();
    for ((_, claim) in claims.entries()) {
      let keep = switch (status) {
        case (?s) { claim.status == s };
        case null { true };
      };
      if (keep) { out.add(toView(claim)) };
    };
    out.toArray().sort(func(a, b) = Nat.compare(b.createdAt, a.createdAt));
  };

  /// List claims filed against a report.
  public func listForReport(
    claims : Map.Map<Common.ClaimId, Claim>,
    reportId : Common.ReportId,
  ) : [ClaimView] {
    let out = List.empty<ClaimView>();
    for ((_, claim) in claims.entries()) {
      if (claim.reportId == reportId) { out.add(toView(claim)) };
    };
    out.toArray().sort(func(a, b) = Nat.compare(b.createdAt, a.createdAt));
  };

  func update(
    claims : Map.Map<Common.ClaimId, Claim>,
    claim : Claim,
    status : Common.ClaimStatus,
    note : ?Text,
  ) : ClaimView {
    let updated : Claim = {
      id = claim.id;
      reportId = claim.reportId;
      claimantName = claim.claimantName;
      claimantEmail = claim.claimantEmail;
      claimantPhone = claim.claimantPhone;
      proof = claim.proof;
      status;
      reviewNote = note;
      returnCodeHash = claim.returnCodeHash;
      returnCodeExpiresAt = claim.returnCodeExpiresAt;
      returnCodeUsed = claim.returnCodeUsed;
      createdAt = claim.createdAt;
      updatedAt = Common.now();
    };
    claims.add(claim.id, updated);
    toView(updated);
  };

  /// Approve a claim, issuing a single-use expiring return code.
  public func approve(
    claims : Map.Map<Common.ClaimId, Claim>,
    id : Common.ClaimId,
    note : ?Text,
  ) : ?ApprovalResult {
    switch (claims.get(id)) {
      case (?claim) {
        let code = newReturnCode(id);
        let expiresAt = Common.now() + returnCodeTtl;
        let updated : Claim = {
          id = claim.id;
          reportId = claim.reportId;
          claimantName = claim.claimantName;
          claimantEmail = claim.claimantEmail;
          claimantPhone = claim.claimantPhone;
          proof = claim.proof;
          status = #approved;
          reviewNote = note;
          returnCodeHash = ?ReportsLib.hash(code);
          returnCodeExpiresAt = ?expiresAt;
          returnCodeUsed = false;
          createdAt = claim.createdAt;
          updatedAt = Common.now();
        };
        claims.add(id, updated);
        ?{ claim = toView(updated); returnCode = code; expiresAt };
      };
      case null { null };
    };
  };

  /// Reject a claim.
  public func reject(
    claims : Map.Map<Common.ClaimId, Claim>,
    id : Common.ClaimId,
    note : ?Text,
  ) : ?ClaimView {
    switch (claims.get(id)) {
      case (?claim) { ?update(claims, claim, #rejected, note) };
      case null { null };
    };
  };

  /// Mark a claim as disputed.
  public func dispute(
    claims : Map.Map<Common.ClaimId, Claim>,
    id : Common.ClaimId,
    note : ?Text,
  ) : ?ClaimView {
    switch (claims.get(id)) {
      case (?claim) { ?update(claims, claim, #disputed, note) };
      case null { null };
    };
  };

  /// Validate and consume a return code exactly once.
  public func verifyReturn(
    claims : Map.Map<Common.ClaimId, Claim>,
    reports : Map.Map<Common.ReportId, Reports.Report>,
    code : Common.ReturnCode,
  ) : ?ReturnResult {
    let hashed = ReportsLib.hash(code);
    for ((_, claim) in claims.entries()) {
      switch (claim.returnCodeHash) {
        case (?h) {
          if (h == hashed) {
            if (claim.returnCodeUsed) { return null };
            let expiresAt = claim.returnCodeExpiresAt ?? 0;
            if (Common.now() > expiresAt) { return null };
            let now = Common.now();
            let updated : Claim = {
              id = claim.id;
              reportId = claim.reportId;
              claimantName = claim.claimantName;
              claimantEmail = claim.claimantEmail;
              claimantPhone = claim.claimantPhone;
              proof = claim.proof;
              status = claim.status;
              reviewNote = claim.reviewNote;
              returnCodeHash = claim.returnCodeHash;
              returnCodeExpiresAt = claim.returnCodeExpiresAt;
              returnCodeUsed = true;
              createdAt = claim.createdAt;
              updatedAt = now;
            };
            claims.add(claim.id, updated);
            ignore ReportsLib.setStatus(reports, claim.reportId, #returned);
            return ?{ claimId = claim.id; reportId = claim.reportId; returnedAt = now };
          };
        };
        case null {};
      };
    };
    null;
  };
};
