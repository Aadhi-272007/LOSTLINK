import { generateCode } from "@/lib/lostlink";

const RETURN_TTL_MS = 72 * 60 * 60 * 1000;

/** Everything the staff dashboard shows: reports, claims and the headline counts. */
export async function adminOverview(client, { reportStatus } = {}) {
  const reportQuery = reportStatus ? { status: reportStatus } : {};

  const [reports, claims, activeCount, returnedCount, pendingClaims] = await Promise.all([
    client.entities.Report.filter(reportQuery, { sort: "-created_date", limit: 100 }),
    client.entities.Claim.filter({}, { sort: "-created_date", limit: 100 }),
    client.entities.Report.count({ status: "active" }),
    client.entities.Report.count({ status: "returned" }),
    client.entities.Claim.count({ status: "pending" }),
  ]);

  return {
    reports: reports.items.map((report) => ({
      id: report.id,
      kind: report.kind,
      title: report.title,
      category: report.category,
      location: report.location,
      occurred_at: report.occurred_at,
      status: report.status,
      contact_name: report.contact_name,
      contact_email: report.contact_email,
      contact_phone: report.contact_phone ?? "",
    })),
    claims: claims.items,
    stats: {
      active: activeCount,
      returned: returnedCount,
      pendingClaims,
      claims: claims.items.length,
    },
  };
}

export async function moderateReport(client, { id, status }) {
  await client.entities.Report.update(id, { status });
  return { ok: true };
}

export async function reviewClaim(client, { id, decision, note }) {
  const claim = await client.entities.Claim.get(id);
  const decidedAt = new Date().toISOString();

  if (decision !== "approved") {
    await client.entities.Claim.update(id, {
      status: decision,
      review_note: note || "",
      decided_at: decidedAt,
      return_code: "",
      return_code_expires_at: "",
    });
    return { ok: true, return_code: null };
  }

  const return_code = generateCode("RV");
  const expires = new Date(Date.now() + RETURN_TTL_MS).toISOString();
  await client.entities.Claim.update(id, {
    status: "approved",
    review_note: note || "",
    decided_at: decidedAt,
    return_code,
    return_code_expires_at: expires,
    return_code_used: false,
  });
  await client.entities.Report.update(claim.report_id, { status: "hidden" });

  return { ok: true, return_code, expires_at: expires };
}