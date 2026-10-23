import Map "mo:core/Map";
import Result "mo:core/Result";
import Principal "mo:core/Principal";
import Types "../types/claims";
import Reports "../types/reports";
import Common "../types/common";
import ClaimsLib "../lib/claims";

mixin (
  claims : Map.Map<Common.ClaimId, Types.Claim>,
  claimState : { var nextClaimId : Nat },
  reports : Map.Map<Common.ReportId, Reports.Report>,
) {
  /// Per-caller claim timestamps for rate limiting (transient).
  transient let claimLog = Map.empty<Principal, [Common.Timestamp]>();

  transient let claimWindow : Nat = 60000;
  transient let claimMax : Nat = 3;

  func claimRateLimited(caller : Principal) : Bool {
    let now = Common.now();
    let recent = switch (claimLog.get(caller)) {
      case (?times) { times.filter(func(t) = now < t + claimWindow) };
      case null { [] };
    };
    if (recent.size() >= claimMax) {
      claimLog.add(caller, recent);
      return true;
    };
    claimLog.add(caller, recent.concat([now]));
    false;
  };

  /// File a claim on a found report with proof of ownership.
  public shared ({ caller }) func fileClaim(input : Types.ClaimInput) : async Result.Result<Types.ClaimView, Common.ApiError> {
    if (claimRateLimited(caller)) { return #err(#rateLimited) };
    if (input.claimantName.size() < 2) { return #err(#invalidInput("Name is required")) };
    if (not input.claimantEmail.contains(#text "@")) { return #err(#invalidInput("A valid email is required")) };
    if (input.proof.size() < 10) { return #err(#invalidInput("Proof of ownership must be at least 10 characters")) };
    switch (ClaimsLib.create(claims, claimState, reports, input)) {
      case (?view) { #ok(view) };
      case null { #err(#notFound) };
    };
  };

  /// List claims filed against a report.
  public query func listClaimsForReport(reportId : Common.ReportId) : async [Types.ClaimView] {
    ClaimsLib.listForReport(claims, reportId);
  };

  /// Validate and consume a single-use return-verification code.
  public shared ({ caller }) func verifyReturnCode(code : Common.ReturnCode) : async Result.Result<Types.ReturnResult, Common.ApiError> {
    ignore caller;
    switch (ClaimsLib.verifyReturn(claims, reports, code)) {
      case (?result) { #ok(result) };
      case null { #err(#alreadyUsed) };
    };
  };
};
