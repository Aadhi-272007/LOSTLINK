import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/matching";
import Reports "../types/reports";
import ReportsLib "reports";
import Common "../types/common";

module {
  public type Match = Types.Match;
  public type MatchDetail = Types.MatchDetail;

  /// Split text into lowercase word tokens.
  func tokens(text : Text) : [Text] {
    text.toLower().split(#predicate(func(c) = c == ' ' or c == ',' or c == '.' or c == '-' or c == '_' or c == '/')).filter(func(t) = t.size() > 1).toArray();
  };

  /// Fraction of shared tokens between two texts, scaled to 0..100.
  func textSimilarity(a : Text, b : Text) : Nat {
    let ta = tokens(a);
    let tb = tokens(b);
    if (ta.size() == 0 or tb.size() == 0) { return 0 };
    var common = 0;
    for (x in ta.values()) {
      if (tb.any(func(y) = y == x)) { common += 1 };
    };
    let denom = Nat.max(ta.size(), tb.size());
    (common * 100) / denom;
  };

  /// Score a lost/found pair and produce a plain-language explanation.
  public func score(lost : Reports.Report, found : Reports.Report) : (Nat, Text) {
    var total = 0;
    let reasons = List.empty<Text>();

    // Category match: 35 points.
    if (lost.category.toLower() == found.category.toLower()) {
      total += 35;
      reasons.add("same category (" # lost.category # ")");
    };

    // Title similarity: up to 30 points.
    let titleSim = textSimilarity(lost.title, found.title);
    let titlePoints = (titleSim * 30) / 100;
    total += titlePoints;
    if (titlePoints >= 15) {
      reasons.add("similar item name");
    };

    // Description similarity: up to 15 points.
    let descSim = textSimilarity(lost.description, found.description);
    let descPoints = (descSim * 15) / 100;
    total += descPoints;
    if (descPoints >= 8) {
      reasons.add("matching description details");
    };

    // Location similarity: up to 12 points.
    let locSim = textSimilarity(lost.location, found.location);
    let locPoints = (locSim * 12) / 100;
    total += locPoints;
    if (locPoints >= 6) {
      reasons.add("nearby location");
    };

    // Date proximity: up to 8 points (within 7 days).
    let diff = if (lost.occurredAt > found.occurredAt) {
      lost.occurredAt - found.occurredAt;
    } else {
      found.occurredAt - lost.occurredAt;
    };
    let sevenDays : Nat = 604800000;
    if (diff <= sevenDays) {
      let datePoints = 8 - ((diff * 8) / sevenDays);
      total += datePoints;
      if (datePoints >= 4) { reasons.add("reported around the same time") };
    };

    let capped = Nat.min(total, 100);
    let explanation = if (reasons.size() == 0) {
      "Weak match: few shared attributes.";
    } else {
      "Matched on " # reasons.toArray().values().join(", ") # ".";
    };
    (capped, explanation);
  };

  func isActive(report : Reports.Report) : Bool {
    report.status == #active;
  };

  /// Recompute and store match suggestions for a report.
  public func recomputeFor(
    matches : Map.Map<Common.MatchId, Match>,
    state : { var nextMatchId : Nat },
    reports : Map.Map<Common.ReportId, Reports.Report>,
    reportId : Common.ReportId,
  ) : () {
    let subject = switch (reports.get(reportId)) {
      case (?r) { r };
      case null { return };
    };
    if (not isActive(subject)) { return };

    // Remove existing matches involving this report.
    let existing = matches.toArray();
    for ((id, m) in existing.values()) {
      if (m.lostReportId == reportId or m.foundReportId == reportId) {
        matches.remove(id);
      };
    };

    for ((_, other) in reports.entries()) {
      if (other.id != reportId and isActive(other)) {
        let (lost, found) = if (subject.kind == #lost and other.kind == #found) {
          (subject, other);
        } else if (subject.kind == #found and other.kind == #lost) {
          (other, subject);
        } else {
          continue;
        };
        let (scoreValue, explanation) = score(lost, found);
        if (scoreValue >= 40) {
          let id = state.nextMatchId;
          state.nextMatchId := id + 1;
          matches.add(id, {
            id;
            lostReportId = lost.id;
            foundReportId = found.id;
            score = scoreValue;
            explanation;
            createdAt = Common.now();
          });
        };
      };
    };
  };

  func toDetail(m : Match, reports : Map.Map<Common.ReportId, Reports.Report>) : ?MatchDetail {
    switch (reports.get(m.lostReportId), reports.get(m.foundReportId)) {
      case (?lost, ?found) {
        ?{
          id = m.id;
          score = m.score;
          explanation = m.explanation;
          createdAt = m.createdAt;
          lost = ReportsLib.toView(lost);
          found = ReportsLib.toView(found);
        };
      };
      case _ { null };
    };
  };

  /// List match details for a report.
  public func listForReport(
    matches : Map.Map<Common.MatchId, Match>,
    reports : Map.Map<Common.ReportId, Reports.Report>,
    reportId : Common.ReportId,
  ) : [MatchDetail] {
    let out = List.empty<MatchDetail>();
    for ((_, m) in matches.entries()) {
      if (m.lostReportId == reportId or m.foundReportId == reportId) {
        switch (toDetail(m, reports)) {
          case (?d) { out.add(d) };
          case null {};
        };
      };
    };
    out.toArray().sort(func(a, b) = Nat.compare(b.score, a.score));
  };

  /// List all match details.
  public func listAll(
    matches : Map.Map<Common.MatchId, Match>,
    reports : Map.Map<Common.ReportId, Reports.Report>,
  ) : [MatchDetail] {
    let out = List.empty<MatchDetail>();
    for ((_, m) in matches.entries()) {
      switch (toDetail(m, reports)) {
        case (?d) { out.add(d) };
        case null {};
      };
    };
    out.toArray().sort(func(a, b) = Nat.compare(b.score, a.score));
  };

  /// Fetch a single match detail by id.
  public func get(
    matches : Map.Map<Common.MatchId, Match>,
    reports : Map.Map<Common.ReportId, Reports.Report>,
    id : Common.MatchId,
  ) : ?MatchDetail {
    switch (matches.get(id)) {
      case (?m) { toDetail(m, reports) };
      case null { null };
    };
  };
};
