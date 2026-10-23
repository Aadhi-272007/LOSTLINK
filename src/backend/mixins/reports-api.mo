import Map "mo:core/Map";
import Result "mo:core/Result";
import Principal "mo:core/Principal";
import Types "../types/reports";
import MatchTypes "../types/matching";
import Common "../types/common";
import ReportsLib "../lib/reports";
import MatchingLib "../lib/matching";

mixin (
  reports : Map.Map<Common.ReportId, Types.Report>,
  reportState : { var nextReportId : Nat },
  matches : Map.Map<Common.MatchId, MatchTypes.Match>,
  matchState : { var nextMatchId : Nat },
) {
  /// Per-caller submission timestamps for rate limiting (transient).
  transient let submitLog = Map.empty<Principal, [Common.Timestamp]>();

  transient let submitWindow : Nat = 60000;
  transient let submitMax : Nat = 5;

  func rateLimited(caller : Principal) : Bool {
    let now = Common.now();
    let recent = switch (submitLog.get(caller)) {
      case (?times) {
        times.filter(func(t) = now < t + submitWindow);
      };
      case null { [] };
    };
    if (recent.size() >= submitMax) {
      submitLog.add(caller, recent);
      return true;
    };
    submitLog.add(caller, recent.concat([now]));
    false;
  };

  func validate(input : Types.ReportInput) : ?Text {
    if (input.title.size() < 3 or input.title.size() > 120) { return ?"Title must be 3-120 characters" };
    if (input.description.size() < 10 or input.description.size() > 2000) { return ?"Description must be 10-2000 characters" };
    if (input.category.size() == 0) { return ?"Category is required" };
    if (input.location.size() == 0) { return ?"Location is required" };
    if (input.contact.name.size() == 0) { return ?"Contact name is required" };
    if (not input.contact.email.contains(#text "@")) { return ?"A valid contact email is required" };
    null;
  };

  /// Submit a Lost or Found report without login.
  public shared ({ caller }) func submitReport(input : Types.ReportInput) : async Result.Result<Types.SubmitResult, Common.ApiError> {
    if (rateLimited(caller)) { return #err(#rateLimited) };
    switch (validate(input)) {
      case (?msg) { #err(#invalidInput(msg)) };
      case null {
        let result = ReportsLib.create(reports, reportState, input);
        MatchingLib.recomputeFor(matches, matchState, reports, result.report.id);
        #ok(result);
      };
    };
  };

  /// Fetch a public report view by id.
  public query func getReport(id : Common.ReportId) : async ?Types.ReportView {
    ReportsLib.get(reports, id);
  };

  /// List reports with search, filters, sorting, and pagination.
  public query func listReports(filter : Types.ReportQuery) : async Types.ReportPage {
    ReportsLib.list(reports, filter);
  };

  /// List reports owned by a management code.
  public query func listMyReports(code : Common.ManagementCode) : async [Types.ReportView] {
    ReportsLib.listOwned(reports, code);
  };

  /// Edit a report after verifying its management code.
  public shared ({ caller }) func editReport(
    id : Common.ReportId,
    code : Common.ManagementCode,
    edit : Types.ReportEdit,
  ) : async Result.Result<Types.ReportView, Common.ApiError> {
    ignore caller;
    if (edit.title.size() < 3 or edit.title.size() > 120) { return #err(#invalidInput("Title must be 3-120 characters")) };
    if (edit.description.size() < 10 or edit.description.size() > 2000) { return #err(#invalidInput("Description must be 10-2000 characters")) };
    switch (ReportsLib.edit(reports, id, code, edit)) {
      case (?view) {
        MatchingLib.recomputeFor(matches, matchState, reports, id);
        #ok(view);
      };
      case null { #err(#notAuthorized) };
    };
  };

  /// Withdraw (close) a report after verifying its management code.
  public shared ({ caller }) func withdrawReport(
    id : Common.ReportId,
    code : Common.ManagementCode,
  ) : async Result.Result<(), Common.ApiError> {
    ignore caller;
    if (ReportsLib.withdraw(reports, id, code)) {
      MatchingLib.recomputeFor(matches, matchState, reports, id);
      #ok(());
    } else {
      #err(#notAuthorized);
    };
  };
};
