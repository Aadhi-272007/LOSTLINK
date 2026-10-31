import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Keyboard, QrCode } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Scanner from "@/components/scan/Scanner";
import { parseReportCode } from "@/lib/scan";

export const Route = createFileRoute("/_site/scan")({
  head: () => ({
    meta: [
      { title: "Scan a QR code — LostLink" },
      {
        name: "description",
        content: "Scan the QR code on an item to open its LostLink report instantly.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [manual, setManual] = useState("");
  const [error, setError] = useState(null);

  const open = (raw) => {
    const id = parseReportCode(raw);
    if (!id) {
      setError("That doesn't look like a LostLink report code. Check the code and try again.");
      return;
    }
    setError(null);
    navigate({ to: "/items/$reportId", params: { reportId: id } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <PageHeader
        eyebrow="Scan QR"
        title="Open a report by QR code"
        description="Every report gets its own QR code. Scan the sticker on an item, or type the report code if the camera isn't available."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Scanner onDetect={open} />

        <div className="rounded-xl border border-border bg-card p-5 shadow-subtle">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Keyboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold tracking-tight">
            Enter a code instead
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste the report link or the code printed under the QR sticker.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              open(manual);
            }}
          >
            <input
              value={manual}
              onChange={(event) => setManual(event.target.value)}
              placeholder="e.g. 67f2c9a1e4b0d3 or /items/67f2c9a1"
              aria-label="Report code"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-fast focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-smooth hover:-translate-y-0.5"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Open report
            </button>
          </form>
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Camera tips</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use the rear camera and fill about half the frame with the code.</li>
          <li>Bright light and a flat sticker decode fastest.</li>
          <li>No camera or permission blocked? The manual code box works everywhere.</li>
        </ul>
      </div>
    </div>
  );
}