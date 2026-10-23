import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type ReportId = Nat;
  type MatchId = Nat;
  type ClaimId = Nat;
  type AuditId = Nat;
  type Timestamp = Nat;

  type ContactInfo = { name : Text; email : Text; phone : ?Text };
  type ReportKind = { #lost; #found };
  type ReportStatus = { #active; #hidden; #removed; #returned; #withdrawn };
  type ClaimStatus = { #pending; #approved; #rejected; #disputed };

  type Report = {
    id : ReportId;
    kind : ReportKind;
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    holdingLocation : ?Text;
    occurredAt : Timestamp;
    photo : ?Text;
    contact : ContactInfo;
    managementCodeHash : Text;
    status : ReportStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type Match = {
    id : MatchId;
    lostReportId : ReportId;
    foundReportId : ReportId;
    score : Nat;
    explanation : Text;
    createdAt : Timestamp;
  };

  type Claim = {
    id : ClaimId;
    reportId : ReportId;
    claimantName : Text;
    claimantEmail : Text;
    claimantPhone : ?Text;
    proof : Text;
    status : ClaimStatus;
    reviewNote : ?Text;
    returnCodeHash : ?Text;
    returnCodeExpiresAt : ?Timestamp;
    returnCodeUsed : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type AuditEvent = {
    id : AuditId;
    actorPrincipal : Text;
    action : Text;
    subject : Text;
    detail : Text;
    createdAt : Timestamp;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    reports : Map.Map<ReportId, Report>;
    matches : Map.Map<MatchId, Match>;
    claims : Map.Map<ClaimId, Claim>;
    audit : Map.Map<AuditId, AuditEvent>;
    reportState : { var nextReportId : Nat };
    matchState : { var nextMatchId : Nat };
    claimState : { var nextClaimId : Nat };
    auditState : { var nextAuditId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      reports = Map.empty();
      matches = Map.empty();
      claims = Map.empty();
      audit = Map.empty();
      reportState = { var nextReportId = 0 };
      matchState = { var nextMatchId = 0 };
      claimState = { var nextClaimId = 0 };
      auditState = { var nextAuditId = 0 };
    };
  };
};
