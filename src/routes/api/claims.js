import { createFileRoute } from "@tanstack/react-router";
import { claimInput, saveClaim } from "@/lib/reports-fns";

// Anyone may claim a found item; the claim is reviewed by staff, so nobody needs
// an account to file one.
export const Route = createFileRoute("/api/claims")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "The claim could not be read." }, { status: 400 });
        }

        const parsed = claimInput.safeParse(payload ?? {});
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Some fields need another look." },
            { status: 400 }
          );
        }

        const result = await saveClaim(context.getBase44().asServiceRole, parsed.data);
        if (!result.ok) {
          return Response.json(
            { error: "This item can no longer be claimed." },
            { status: result.error === "notFound" ? 404 : 409 }
          );
        }
        return Response.json(result, { status: 201 });
      },
    },
  },
});