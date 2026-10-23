import Map "mo:core/Map";
import Result "mo:core/Result";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/admin";
import Reports "../types/reports";
import Claims "../types/claims";
import Common "../types/common";
import ClaimsLib "../lib/claims";
import AdminLib "../lib/admin";
import ReportsLib "../lib/reports";

mixin (
  accessControlState : AccessControl.AccessControlState,
  audit : Map.Map<Common.AuditId, Types.AuditEvent>,
  auditState : { var nextAuditId : Nat },
  reports : Map.Map<Common.ReportId, Reports.Report>,
  claims : Map.Map<Common.ClaimId, Claims.Claim>,
) {
  func requireAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  /// List all claims for the admin claim queue.
  public query ({ caller }) func adminListClaims(status : ?Common.ClaimStatus) : async [Claims.ClaimView] {
    if (not requireAdmin(caller)) { return [] };
    ClaimsLib.list(claims, status);
  };

  /// Approve a claim, issuing a single-use return code.
  public shared ({ caller }) func adminApproveClaim(id : Common.ClaimId, note : ?Text) : async Result.Result<Claims.ApprovalResult, Common.ApiError> {
    if (not requireAdmin(caller)) { return #err(#notAuthorized) };
    switch (ClaimsLib.approve(claims, id, note)) {
      case (?result) {
        AdminLib.record(audit, auditState, caller.toText(), "approve_claim", id.toText(), "Claim approved");
        #ok(result);
      };
      case null { #err(#notFound) };
    };
  };

  /// Reject a claim.
  public shared ({ caller }) func adminRejectClaim(id : Common.ClaimId, note : ?Text) : async Result.Result<Claims.ClaimView, Common.ApiError> {
    if (not requireAdmin(caller)) { return #err(#notAuthorized) };
    switch (ClaimsLib.reject(claims, id, note)) {
      case (?view) {
        AdminLib.record(audit, auditState, caller.toText(), "reject_claim", id.toText(), "Claim rejected");
        #ok(view);
      };
      case null { #err(#notFound) };
    };
  };

  /// Mark a claim as disputed.
  public shared ({ caller }) func adminDisputeClaim(id : Common.ClaimId, note : ?Text) : async Result.Result<Claims.ClaimView, Common.ApiError> {
    if (not requireAdmin(caller)) { return #err(#notAuthorized) };
    switch (ClaimsLib.dispute(claims, id, note)) {
      case (?view) {
        AdminLib.record(audit, auditState, caller.toText(), "dispute_claim", id.toText(), "Claim disputed");
        #ok(view);
      };
      case null { #err(#notFound) };
    };
  };

  /// Set a report's moderation status.
  public shared ({ caller }) func adminSetReportStatus(id : Common.ReportId, status : Common.ReportStatus) : async Result.Result<(), Common.ApiError> {
    if (not requireAdmin(caller)) { return #err(#notAuthorized) };
    if (ReportsLib.setStatus(reports, id, status)) {
      AdminLib.record(audit, auditState, caller.toText(), "set_report_status", id.toText(), "Report status updated");
      #ok(());
    } else {
      #err(#notFound);
    };
  };

  /// List audit events, newest first.
  public query ({ caller }) func adminListAudit(page : Nat, pageSize : Nat) : async Types.AuditPage {
    if (not requireAdmin(caller)) {
      return { items = []; total = 0; page; pageSize };
    };
    AdminLib.list(audit, page, pageSize);
  };
};
