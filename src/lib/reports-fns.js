import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PAGE_SIZE, MATCH_THRESHOLD } from "@/lib/constants";
import {
  generateCode,
  publicView,
  pairReports,
  scorePair,
} from "@/lib/lostlink";

const service = (context) => context.getBase44().asServiceRole;

async function loadActive(client, kind) {
  const page = await client.entities.Report.filter(
    { kind, status: "active" },
    { sort: "-created_date", limit: 200 }
  );
  return page.items ?? [];
}

/** One report with its suggested matches and claim state, for the item page. */
export async function loadReportDetail(client, id) {
  let report;
  try {
    report = await client.entities.Report.get(id);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
  if (!report || report.status === "removed") return null;

  const [lost, found, claims] = await Promise.all([
    loadActive(client, "lost"),
    loadActive(client, "found"),
    client.entities.Claim.filter({ report_id: report.id }, { limit: 50 }),
  ]);

  return {
    report: publicView(report),
    matches: pairReports(lost, found, MATCH_THRESHOLD).filter(
      (match) => match.lost.id === report.id || match.found.id === report.id
    ),
    claimCount: (claims.items ?? []).length,
    canClaim: report.kind === "found" && report.status === "active",
  };
}

/** One lost/found pair, identified as `lostId__foundId`. */
export async function loadMatch(client, id) {
  const [lostId, foundId] = String(id).split("__");
  if (!lostId || !foundId) return null;
  let lost;
  let found;
  try {
    [lost, found] = await Promise.all([
      client.entities.Report.get(lostId),
      client.entities.Report.get(foundId),
    ]);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
  if (!lost || !found || lost.kind !== "lost" || found.kind !== "found") return null;
  const { score, explanation } = scorePair(lost, found);
  return { id, score, explanation, lost: publicView(lost), found: publicView(found) };
}

export const claimInput = z.object({
  report_id: z.string().min(1),
  claimant_name: z.string().trim().min(1).max(120),
  claimant_email: z.string().trim().email().max(200),
  claimant_phone: z.string().trim().max(40).optional(),
  proof: z.string().trim().min(10).max(2000),
});

/** File an ownership claim on a found report that is still active. */
export async function saveClaim(client, data) {
  let report;
  try {
    report = await client.entities.Report.get(data.report_id);
  } catch (error) {
    if (error?.status === 404) return { ok: false, error: "notFound" };
    throw error;
  }
  if (!report || report.kind !== "found" || report.status !== "active") {
    return { ok: false, error: "notClaimable" };
  }
  const claim = await client.entities.Claim.create({
    report_id: report.id,
    report_title: report.title,
    claimant_name: data.claimant_name,
    claimant_email: data.claimant_email,
    claimant_phone: data.claimant_phone || "",
    proof: data.proof,
    status: "pending",
    return_code_used: false,
  });
  return { ok: true, id: claim.id };
}

export const reportFields = {
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(2000),
  category: z.string().trim().min(1).max(60),
  location: z.string().trim().min(1).max(120),
  holding_location: z.string().trim().max(120).optional(),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  photo_url: z.string().trim().max(500).optional(),
  contact_name: z.string().trim().min(1).max(120),
  contact_email: z.string().trim().email().max(200),
  contact_phone: z.string().trim().max(40).optional(),
};

export const reportInput = z.object({ kind: z.enum(["lost", "found"]), ...reportFields });

/** Store a new report and return what the reporter needs (id, title, code). */
export async function createReport(client, data) {
  const management_code = generateCode("LL");
  const created = await client.entities.Report.create({
    ...data,
    photo_url: data.photo_url || "",
    holding_location: data.holding_location || "",
    contact_phone: data.contact_phone || "",
    management_code,
    status: "active",
  });
  return {
    id: created.id,
    title: created.title,
    kind: created.kind,
    management_code,
  };
}

export const submitReport = createServerFn({ method: "POST" })
  .validator(reportInput)
  .handler(({ data, context }) => createReport(service(context), data));

export const listReports = createServerFn({ method: "POST" })
  .validator(
    z.object({
      kind: z.enum(["lost", "found"]).optional(),
      category: z.string().max(60).optional(),
      q: z.string().max(120).optional(),
      sort: z.enum(["newest", "oldest"]).optional(),
      page: z.number().int().min(1).max(50).optional(),
      pageSize: z.number().int().min(1).max(24).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const entities = service(context).entities;
    const base = { status: "active" };
    if (data.kind) base.kind = data.kind;
    if (data.category) base.category = data.category;

    const query = data.q
      ? {
          $and: [
            base,
            {
              $or: [
                { title: { $regex: data.q, $options: "i" } },
                { description: { $regex: data.q, $options: "i" } },
              ],
            },
          ],
        }
      : base;

    const sort = data.sort === "oldest" ? "occurred_at" : "-created_date";
    const page = data.page ?? 1;
    const size = data.pageSize ?? PAGE_SIZE;
    const start = (page - 1) * size;

    const [records, total] = await Promise.all([
      entities.Report.filter(query, { sort, limit: 200 }),
      entities.Report.count(query),
    ]);

    return {
      items: records.items.slice(start, start + size).map(publicView),
      total,
      page,
      pageSize: size,
    };
  });

export const getReport = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data, context }) => loadReportDetail(service(context), data.id));

export const listMatches = createServerFn({ method: "POST" })
  .validator(
    z.object({ minScore: z.number().int().min(MATCH_THRESHOLD).max(100).optional() })
  )
  .handler(async ({ data, context }) => {
    const client = service(context);
    const [lost, found] = await Promise.all([
      loadActive(client, "lost"),
      loadActive(client, "found"),
    ]);
    const matches = pairReports(lost, found, data.minScore ?? MATCH_THRESHOLD).slice(0, 60);
    return { matches, count: matches.length };
  });

export const getMatch = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(3).max(120) }))
  .handler(({ data, context }) => loadMatch(service(context), data.id));

export const fileClaim = createServerFn({ method: "POST" })
  .validator(claimInput)
  .handler(({ data, context }) => saveClaim(service(context), data));

export const getMyReport = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), code: z.string().min(4).max(40) }))
  .handler(async ({ data, context }) => {
    const client = service(context);
    let report;
    try {
      report = await client.entities.Report.get(data.id);
    } catch (error) {
      if (error?.status === 404) return null;
      throw error;
    }
    if (!report || report.management_code !== data.code) return null;
    return report;
  });

export const listMyReports = createServerFn({ method: "POST" })
  .validator(z.object({ codes: z.array(z.string().min(4).max(40)).max(50) }))
  .handler(async ({ data, context }) => {
    if (!data.codes.length) return { items: [] };
    const client = service(context);
    const page = await client.entities.Report.filter(
      { management_code: { $in: data.codes } },
      { sort: "-created_date", limit: 50 }
    );
    return {
      items: page.items.map((report) => ({
        ...publicView(report),
        management_code: report.management_code,
        contact_name: report.contact_name,
        contact_email: report.contact_email,
        contact_phone: report.contact_phone ?? "",
      })),
    };
  });

export const updateMyReport = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1),
      code: z.string().min(4).max(40),
      ...reportFields,
    })
  )
  .handler(async ({ data, context }) => {
    const client = service(context);
    const report = await client.entities.Report.get(data.id);
    if (!report || report.management_code !== data.code) {
      return { ok: false, error: "notAuthorized" };
    }
    if (report.status === "removed" || report.status === "returned") {
      return { ok: false, error: "locked" };
    }
    const { id, code, ...patch } = data;
    await client.entities.Report.update(id, {
      ...patch,
      photo_url: patch.photo_url || "",
      holding_location: patch.holding_location || "",
      contact_phone: patch.contact_phone || "",
    });
    return { ok: true };
  });

export const withdrawMyReport = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), code: z.string().min(4).max(40) }))
  .handler(async ({ data, context }) => {
    const client = service(context);
    const report = await client.entities.Report.get(data.id);
    if (!report || report.management_code !== data.code) {
      return { ok: false, error: "notAuthorized" };
    }
    await client.entities.Report.update(data.id, { status: "withdrawn" });
    return { ok: true };
  });

export const returnCodeInput = z.object({ code: z.string().trim().min(4).max(40) });

/** Burns a single-use return code and marks its report returned. */
export async function verifyReturnCode(client, rawCode) {
  const found = await client.entities.Claim.filter(
    { return_code: rawCode.trim().toUpperCase() },
    { limit: 1 }
  );
  const claim = found.items[0];
  if (!claim) return { ok: false, error: "invalid" };
  if (claim.status !== "approved") return { ok: false, error: "notApproved" };
  if (claim.return_code_used) return { ok: false, error: "alreadyUsed" };
  if (!claim.return_code_expires_at || new Date(claim.return_code_expires_at) < new Date()) {
    return { ok: false, error: "expired" };
  }

  const returnedAt = new Date().toISOString();
  await Promise.all([
    client.entities.Claim.update(claim.id, {
      return_code_used: true,
      decided_at: returnedAt,
    }),
    client.entities.Report.update(claim.report_id, { status: "returned" }),
  ]);

  return {
    ok: true,
    report_id: claim.report_id,
    report_title: claim.report_title,
    claimant_name: claim.claimant_name,
    returned_at: returnedAt,
  };
}

export const getStats = createServerFn({ method: "POST" }).handler(async ({ context }) => {
  const entities = service(context).entities;
  const [lost, found, returned] = await Promise.all([
    entities.Report.count({ kind: "lost", status: "active" }),
    entities.Report.count({ kind: "found", status: "active" }),
    entities.Report.count({ status: "returned" }),
  ]);
  return { lost, found, returned };
});