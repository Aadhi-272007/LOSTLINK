import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/admin";
import Common "../types/common";

module {
  public type AuditEvent = Types.AuditEvent;
  public type AuditPage = Types.AuditPage;

  /// Append an audit event.
  public func record(
    audit : Map.Map<Common.AuditId, AuditEvent>,
    state : { var nextAuditId : Nat },
    actorPrincipal : Text,
    action : Text,
    subject : Text,
    detail : Text,
  ) : () {
    let id = state.nextAuditId;
    state.nextAuditId := id + 1;
    audit.add(id, {
      id;
      actorPrincipal;
      action;
      subject;
      detail;
      createdAt = Common.now();
    });
  };

  /// List audit events, newest first, with pagination.
  public func list(
    audit : Map.Map<Common.AuditId, AuditEvent>,
    page : Nat,
    pageSize : Nat,
  ) : AuditPage {
    let all = List.empty<AuditEvent>();
    for ((_, event) in audit.entries()) {
      all.add(event);
    };
    let sorted = all.toArray().sort(func(a, b) = Nat.compare(b.createdAt, a.createdAt));
    let total = sorted.size();
    let size = if (pageSize == 0) { 20 } else { pageSize };
    let start = if (page == 0) { 0 } else { (page - 1) * size };
    let items = if (start >= total) {
      [];
    } else {
      let end = Nat.min(start + size, total);
      sorted.sliceToArray(start.toInt(), end.toInt());
    };
    { items; total; page; pageSize = size };
  };
};
