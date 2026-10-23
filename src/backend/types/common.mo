import Time "mo:core/Time";

module {
  /// Current wall-clock time as milliseconds since the Unix epoch.
  public func now() : Timestamp {
    Time.now().toNat() / 1_000_000;
  };

  /// Unique identifier for a report.
  public type ReportId = Nat;

  /// Unique identifier for a claim.
  public type ClaimId = Nat;

  /// Unique identifier for a match suggestion.
  public type MatchId = Nat;

  /// Unique identifier for an audit log entry.
  public type AuditId = Nat;

  /// Milliseconds since the Unix epoch.
  public type Timestamp = Nat;

  /// A private management code issued to a reporter on submission.
  public type ManagementCode = Text;

  /// A single-use, expiring return-verification code.
  public type ReturnCode = Text;

  /// Whether a report describes a lost or a found item.
  public type ReportKind = { #lost; #found };

  /// Lifecycle status of a report.
  public type ReportStatus = {
    #active;
    #hidden;
    #removed;
    #returned;
    #withdrawn;
  };

  /// Lifecycle status of a claim.
  public type ClaimStatus = {
    #pending;
    #approved;
    #rejected;
    #disputed;
  };

  /// A generic failure a caller can act on.
  public type ApiError = {
    #notFound;
    #notAuthorized;
    #invalidInput : Text;
    #rateLimited;
    #conflict : Text;
    #expired;
    #alreadyUsed;
  };
};
