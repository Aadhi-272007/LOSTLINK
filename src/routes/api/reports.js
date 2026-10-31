import { createFileRoute } from "@tanstack/react-router";
import { createReport, loadReportDetail, reportInput } from "@/lib/reports-fns";

const FIELD_LABELS = {
  kind: "Type",
  title: "Title",
  description: "Description",
  category: "Category",
  location: "Location",
  holding_location: "Where it is now",
  occurred_at: "Date",
  contact_name: "Name",
  contact_email: "Email",
  contact_phone: "Phone",
  photo_url: "Photo",
};

// Anyone may post a lost or found item — this is a public board — so the route
// takes no sign-in, validates every field, and returns only the new report's
// id, title and management code.
export const Route = createFileRoute("/api/reports")({
  server: {
    handlers: {
      // `?id=` returns one report with its suggested matches and claim state.
      GET: async ({ request, context }) => {
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return Response.json({ error: "A report id is required." }, { status: 400 });
        const detail = await loadReportDetail(context.getBase44().asServiceRole, id);
        if (!detail) return Response.json({ error: "Report not found." }, { status: 404 });
        return Response.json(detail);
      },
      POST: async ({ request, context }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "The form data could not be read." }, { status: 400 });
        }

        const parsed = reportInput.safeParse(payload ?? {});
        if (!parsed.success) {
          const issue = parsed.error.issues[0];
          const field = typeof issue?.path?.[0] === "string" ? issue.path[0] : null;
          return Response.json(
            {
              error: issue?.message ?? "Some fields need another look.",
              field,
              label: field ? FIELD_LABELS[field] ?? null : null,
            },
            { status: 400 }
          );
        }

        try {
          const created = await createReport(context.getBase44().asServiceRole, parsed.data);
          return Response.json(created, { status: 201 });
        } catch (error) {
          const reason =
            typeof error?.message === "string" && error.message.length <= 180
              ? error.message
              : "The report could not be stored.";
          return Response.json({ error: reason }, { status: 500 });
        }
      },
    },
  },
});