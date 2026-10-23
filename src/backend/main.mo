import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Map "mo:core/Map";

import Common "types/common";
import ReportTypes "types/reports";
import MatchTypes "types/matching";
import ClaimTypes "types/claims";
import AuditTypes "types/admin";

import ReportsApi "mixins/reports-api";
import MatchingApi "mixins/matching-api";
import ClaimsApi "mixins/claims-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let reports : Map.Map<Common.ReportId, ReportTypes.Report>;
  let matches : Map.Map<Common.MatchId, MatchTypes.Match>;
  let claims : Map.Map<Common.ClaimId, ClaimTypes.Claim>;
  let audit : Map.Map<Common.AuditId, AuditTypes.AuditEvent>;

  let reportState : { var nextReportId : Nat };
  let matchState : { var nextMatchId : Nat };
  let claimState : { var nextClaimId : Nat };
  let auditState : { var nextAuditId : Nat };

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include ReportsApi(reports, reportState, matches, matchState);
  include MatchingApi(matches, matchState, reports);
  include ClaimsApi(claims, claimState, reports);
  include AdminApi(accessControlState, audit, auditState, reports, claims);
  include ApiDocMixin();
  include Expose({
    entities = [
      reports.toEntityManual("report", "Report", "id")
        .sample({
          id = 0;
          kind = #lost;
          title = "";
          description = "";
          category = "";
          location = "";
          holdingLocation = ?"";
          occurredAt = 0;
          photo = ?"";
          contact = { name = ""; email = ""; phone = ?"" };
          managementCodeHash = "";
          status = #active;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func r = r.id)
        .payload("kind", func r = switch (r.kind) { case (#lost) "lost"; case (#found) "found" })
        .payload("title", func r = r.title)
        .payload("description", func r = r.description)
        .payload("category", func r = r.category)
        .payload("location", func r = r.location)
        .payload("holdingLocation", func r = r.holdingLocation)
        .payload("occurredAt", func r = r.occurredAt)
        .payload("photo", func r = r.photo)
        .payload("status", func r = switch (r.status) {
          case (#active) "active";
          case (#hidden) "hidden";
          case (#removed) "removed";
          case (#returned) "returned";
          case (#withdrawn) "withdrawn";
        })
        .payload("createdAt", func r = r.createdAt)
        .payload("updatedAt", func r = r.updatedAt)
        .public_()
        .build(),
      matches.toEntityManual("match", "Match", "id")
        .sample({
          id = 0;
          lostReportId = 0;
          foundReportId = 0;
          score = 0;
          explanation = "";
          createdAt = 0;
        })
        .payload("id", func m = m.id)
        .payload("lostReportId", func m = m.lostReportId)
        .payload("foundReportId", func m = m.foundReportId)
        .payload("score", func m = m.score)
        .payload("explanation", func m = m.explanation)
        .payload("createdAt", func m = m.createdAt)
        .public_()
        .build(),
      claims.toEntityManual("claim", "Claim", "id")
        .sample({
          id = 0;
          reportId = 0;
          claimantName = "";
          claimantEmail = "";
          claimantPhone = ?"";
          proof = "";
          status = #pending;
          reviewNote = ?"";
          returnCodeHash = ?"";
          returnCodeExpiresAt = ?0;
          returnCodeUsed = false;
          createdAt = 0;
          updatedAt = 0;
        })
        .payload("id", func c = c.id)
        .payload("reportId", func c = c.reportId)
        .payload("claimantName", func c = c.claimantName)
        .payload("status", func c = switch (c.status) {
          case (#pending) "pending";
          case (#approved) "approved";
          case (#rejected) "rejected";
          case (#disputed) "disputed";
        })
        .payload("createdAt", func c = c.createdAt)
        .payload("updatedAt", func c = c.updatedAt)
        .controllerOnly()
        .build(),
      audit.toEntityManual("auditEvent", "AuditEvent", "id")
        .sample({
          id = 0;
          actorPrincipal = "";
          action = "";
          subject = "";
          detail = "";
          createdAt = 0;
        })
        .payload("id", func a = a.id)
        .payload("actorPrincipal", func a = a.actorPrincipal)
        .payload("action", func a = a.action)
        .payload("subject", func a = a.subject)
        .payload("detail", func a = a.detail)
        .payload("createdAt", func a = a.createdAt)
        .controllerOnly()
        .build(),
    ];
  });
};
