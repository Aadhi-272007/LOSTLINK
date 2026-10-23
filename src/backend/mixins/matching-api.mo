import Map "mo:core/Map";
import Types "../types/matching";
import Reports "../types/reports";
import Common "../types/common";
import MatchingLib "../lib/matching";

mixin (
  matches : Map.Map<Common.MatchId, Types.Match>,
  matchState : { var nextMatchId : Nat },
  reports : Map.Map<Common.ReportId, Reports.Report>,
) {
  /// List match suggestions for a report.
  public query func listMatchesForReport(reportId : Common.ReportId) : async [Types.MatchDetail] {
    MatchingLib.listForReport(matches, reports, reportId);
  };

  /// List all match suggestions.
  public query func listMatches() : async [Types.MatchDetail] {
    MatchingLib.listAll(matches, reports);
  };

  /// Fetch a single match detail by id.
  public query func getMatch(id : Common.MatchId) : async ?Types.MatchDetail {
    MatchingLib.get(matches, reports, id);
  };
};
