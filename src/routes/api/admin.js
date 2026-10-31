import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requireUserRoute } from "@/lib/auth-middleware";
import { adminOverview, moderateReport, reviewClaim } from "@/lib/admin-fns";

const actionBody = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("moderate"),
    id: z.string().min(1),
    status: z.enum(["active", "hidden", "removed", "withdrawn"]),
  }),
  z.object({
    action: z.literal("review"),
    id: z.string().min(1),
    decision: z.enum(["approved", "rejected", "disputed"]),
    note: z.string().trim().max(500).optional(),
  }),
]);

export const Route = createFileRoute("/api/admin")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      GET: async ({ context }) => {
        if (context.user?.role !== "admin") {
          return Response.json({ error: "Staff only." }, { status: 403 });
        }
        return Response.json(await adminOverview(context.getBase44().asServiceRole));
      },
      POST: async ({ request, context }) => {
        if (context.user?.role !== "admin") {
          return Response.json({ error: "Staff only." }, { status: 403 });
        }
        const payload = await request.json().catch(() => null);
        const parsed = actionBody.safeParse(payload ?? {});
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "That action is not valid." },
            { status: 400 }
          );
        }

        const client = context.getBase44().asServiceRole;
        const { action, ...rest } = parsed.data;
        const result =
          action === "moderate" ? await moderateReport(client, rest) : await reviewClaim(client, rest);
        return Response.json(result);
      },
    },
  },
});