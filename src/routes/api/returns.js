import { createFileRoute } from "@tanstack/react-router";
import { returnCodeInput, verifyReturnCode } from "@/lib/reports-fns";

// Desk staff check a code they were shown; the code itself is the secret.
export const Route = createFileRoute("/api/returns")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "The code could not be read." }, { status: 400 });
        }

        const parsed = returnCodeInput.safeParse(payload ?? {});
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Enter a return code." },
            { status: 400 }
          );
        }

        const result = await verifyReturnCode(
          context.getBase44().asServiceRole,
          parsed.data.code
        );
        return Response.json(result);
      },
    },
  },
});