import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/reports";
import Common "../types/common";

module {
  public type Report = Types.Report;
  public type ReportView = Types.ReportView;
  public type ReportInput = Types.ReportInput;
  public type ReportEdit = Types.ReportEdit;
  public type ReportQuery = Types.ReportQuery;
  public type ReportPage = Types.ReportPage;
  public type SubmitResult = Types.SubmitResult;

  /// Convert an internal report to its public projection.
  public func toView(report : Report) : ReportView {
    {
      id = report.id;
      kind = report.kind;
      title = report.title;
      description = report.description;
      category = report.category;
      location = report.location;
      holdingLocation = report.holdingLocation;
      occurredAt = report.occurredAt;
      photo = report.photo;
      status = report.status;
      createdAt = report.createdAt;
      updatedAt = report.updatedAt;
    };
  };

  /// Deterministic non-cryptographic hash used to store management codes.
  public func hash(text : Text) : Text {
    var h : Nat = 5381;
    for (c in text.toIter()) {
      var code = 0;
      for (d in c.toText().toIter()) {
        code := code * 256 + (if (d == '0') 48 else if (d == '1') 49 else if (d == '2') 50 else if (d == '3') 51 else if (d == '4') 52 else if (d == '5') 53 else if (d == '6') 54 else if (d == '7') 55 else if (d == '8') 56 else if (d == '9') 57 else 0);
      };
      h := (h * 33 + code) % 4294967291;
    };
    h.toText();
  };

  /// Generate a fresh, hard-to-guess management code.
  public func newCode(seed : Nat) : Text {
    let now = Common.now();
    let mixed = (seed * 2654435761 + now * 40503 + 12345) % 4294967291;
    let second = (mixed * 1103515245 + 12345) % 4294967291;
    "LL-" # mixed.toText() # "-" # second.toText();
  };

  /// Create a report, returning the view and a fresh management code.
  public func create(
    reports : Map.Map<Common.ReportId, Report>,
    state : { var nextReportId : Nat },
    input : ReportInput,
  ) : SubmitResult {
    let id = state.nextReportId;
    state.nextReportId := id + 1;
    let now = Common.now();
    let code = newCode(id);
    let report : Report = {
      id;
      kind = input.kind;
      title = input.title;
      description = input.description;
      category = input.category;
      location = input.location;
      holdingLocation = input.holdingLocation;
      occurredAt = input.occurredAt;
      photo = input.photo;
      contact = input.contact;
      managementCodeHash = hash(code);
      status = #active;
      createdAt = now;
      updatedAt = now;
    };
    reports.add(id, report);
    { report = toView(report); managementCode = code };
  };

  /// Fetch a report view by id.
  public func get(reports : Map.Map<Common.ReportId, Report>, id : Common.ReportId) : ?ReportView {
    switch (reports.get(id)) {
      case (?report) { ?toView(report) };
      case null { null };
    };
  };

  /// Verify a management code against a report.
  public func verifyCode(report : Report, code : Common.ManagementCode) : Bool {
    report.managementCodeHash == hash(code);
  };

  func matchesQuery(report : Report, q : ReportQuery) : Bool {
    if (report.status == #removed) { return false };
    switch (q.kind) {
      case (?k) { if (report.kind != k) { return false } };
      case null {};
    };
    switch (q.category) {
      case (?c) { if (report.category != c) { return false } };
      case null {};
    };
    switch (q.location) {
      case (?l) {
        if (not report.location.toLower().contains(#text (l.toLower()))) { return false };
      };
      case null {};
    };
    switch (q.fromDate) {
      case (?f) { if (report.occurredAt < f) { return false } };
      case null {};
    };
    switch (q.toDate) {
      case (?t) { if (report.occurredAt > t) { return false } };
      case null {};
    };
    switch (q.search) {
      case (?s) {
        let term = s.toLower();
        if (term.size() > 0) {
          let haystack = (report.title # " " # report.description).toLower();
          if (not haystack.contains(#text term)) { return false };
        };
      };
      case null {};
    };
    true;
  };

  func relevance(report : Report, q : ReportQuery) : Nat {
    switch (q.search) {
      case (?s) {
        let term = s.toLower();
        if (term.size() == 0) { return 0 };
        var score = 0;
        if (report.title.toLower().contains(#text term)) { score += 10 };
        if (report.description.toLower().contains(#text term)) { score += 5 };
        if (report.category.toLower().contains(#text term)) { score += 3 };
        score;
      };
      case null { 0 };
    };
  };

  /// List reports matching a query with filtering, sorting, and pagination.
  public func list(reports : Map.Map<Common.ReportId, Report>, q : ReportQuery) : ReportPage {
    let filtered = List.empty<Report>();
    for ((_, report) in reports.entries()) {
      if (matchesQuery(report, q)) { filtered.add(report) };
    };
    let arr = filtered.toArray();
    let sorted = switch (q.sort) {
      case (#newest) {
        arr.sort(func(a, b) = Nat.compare(b.createdAt, a.createdAt));
      };
      case (#oldest) {
        arr.sort(func(a, b) = Nat.compare(a.createdAt, b.createdAt));
      };
      case (#relevance) {
        arr.sort(func(a, b) = Nat.compare(relevance(b, q), relevance(a, q)));
      };
    };
    let total = sorted.size();
    let pageSize = if (q.pageSize == 0) { 12 } else { q.pageSize };
    let start = if (q.page == 0) { 0 } else { (q.page - 1) * pageSize };
    let items = if (start >= total) {
      [];
    } else {
      let end = Nat.min(start + pageSize, total);
      sorted.sliceToArray(start.toInt(), end.toInt()).map(func(r) = toView(r));
    };
    { items; total; page = q.page; pageSize };
  };

  /// Edit a report after verifying its management code.
  public func edit(
    reports : Map.Map<Common.ReportId, Report>,
    id : Common.ReportId,
    code : Common.ManagementCode,
    edit : ReportEdit,
  ) : ?ReportView {
    switch (reports.get(id)) {
      case (?report) {
        if (not verifyCode(report, code)) { return null };
        let updated : Report = {
          id = report.id;
          kind = report.kind;
          title = edit.title;
          description = edit.description;
          category = edit.category;
          location = edit.location;
          holdingLocation = edit.holdingLocation;
          occurredAt = edit.occurredAt;
          photo = edit.photo;
          contact = edit.contact;
          managementCodeHash = report.managementCodeHash;
          status = report.status;
          createdAt = report.createdAt;
          updatedAt = Common.now();
        };
        reports.add(id, updated);
        ?toView(updated);
      };
      case null { null };
    };
  };

  /// Withdraw (close) a report after verifying its management code.
  public func withdraw(
    reports : Map.Map<Common.ReportId, Report>,
    id : Common.ReportId,
    code : Common.ManagementCode,
  ) : Bool {
    switch (reports.get(id)) {
      case (?report) {
        if (not verifyCode(report, code)) { return false };
        let updated : Report = {
          id = report.id;
          kind = report.kind;
          title = report.title;
          description = report.description;
          category = report.category;
          location = report.location;
          holdingLocation = report.holdingLocation;
          occurredAt = report.occurredAt;
          photo = report.photo;
          contact = report.contact;
          managementCodeHash = report.managementCodeHash;
          status = #withdrawn;
          createdAt = report.createdAt;
          updatedAt = Common.now();
        };
        reports.add(id, updated);
        true;
      };
      case null { false };
    };
  };

  /// List reports owned by a management code.
  public func listOwned(reports : Map.Map<Common.ReportId, Report>, code : Common.ManagementCode) : [ReportView] {
    let owned = List.empty<ReportView>();
    for ((_, report) in reports.entries()) {
      if (verifyCode(report, code)) { owned.add(toView(report)) };
    };
    owned.toArray();
  };

  /// Set a report's moderation status (admin action).
  public func setStatus(
    reports : Map.Map<Common.ReportId, Report>,
    id : Common.ReportId,
    status : Common.ReportStatus,
  ) : Bool {
    switch (reports.get(id)) {
      case (?report) {
        let updated : Report = {
          id = report.id;
          kind = report.kind;
          title = report.title;
          description = report.description;
          category = report.category;
          location = report.location;
          holdingLocation = report.holdingLocation;
          occurredAt = report.occurredAt;
          photo = report.photo;
          contact = report.contact;
          managementCodeHash = report.managementCodeHash;
          status;
          createdAt = report.createdAt;
          updatedAt = Common.now();
        };
        reports.add(id, updated);
        true;
      };
      case null { false };
    };
  };
};
