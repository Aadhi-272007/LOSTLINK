import Common "common";

module {
  public type AuditId = Common.AuditId;
  public type Timestamp = Common.Timestamp;

  /// A recorded administrative action.
  public type AuditEvent = {
    id : AuditId;
    actorPrincipal : Text;
    action : Text;
    subject : Text;
    detail : Text;
    createdAt : Timestamp;
  };

  /// A page of audit events.
  public type AuditPage = {
    items : [AuditEvent];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };
};
