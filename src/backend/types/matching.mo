import Common "common";
import Reports "reports";

module {
  public type MatchId = Common.MatchId;
  public type ReportId = Common.ReportId;
  public type Timestamp = Common.Timestamp;

  /// A suggested match between a lost and a found report.
  public type Match = {
    id : MatchId;
    lostReportId : ReportId;
    foundReportId : ReportId;
    score : Nat;
    explanation : Text;
    createdAt : Timestamp;
  };

  /// A match enriched with both report views for side-by-side display.
  public type MatchDetail = {
    id : MatchId;
    score : Nat;
    explanation : Text;
    createdAt : Timestamp;
    lost : Reports.ReportView;
    found : Reports.ReportView;
  };
};
