import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyReturnCode } from "@/hooks/use-backend";
import { formatDateTime } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReturnVerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    reportId: string;
    returnedAt: bigint;
  } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const verify = useVerifyReturnCode();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value) {
      toast.error("Enter the return code from the approved claim.");
      return;
    }
    setFailure(null);
    verify.mutate(value, {
      onSuccess: (data) => {
        setResult({
          reportId: data.reportId.toString(),
          returnedAt: data.returnedAt,
        });
        setCode("");
      },
      onError: (error) => {
        setFailure(
          error instanceof Error
            ? error.message
            : "This return code could not be verified.",
        );
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <PageHeader
        eyebrow="Return verification"
        title="Verify a return code"
        description="Staff scan or enter the single-use return code issued with an approved claim. Each code works exactly once."
      />

      <Card className="mt-8 rounded-xl border-border shadow-subtle">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-code">Return code</Label>
              <Input
                id="return-code"
                data-ocid="return.code_input"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Paste the code from the approved claim"
                className="rounded-lg font-mono"
              />
            </div>
            <Button
              type="submit"
              data-ocid="return.verify_button"
              className="w-full rounded-lg shadow-elevated"
              disabled={verify.isPending}
            >
              {verify.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Verify and mark returned
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <div data-ocid="success_state" className="mt-8">
          <Card className="rounded-xl border-border shadow-subtle">
            <CardContent className="space-y-4 pt-6 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[oklch(var(--status-approved-bg))] text-[oklch(var(--status-approved-foreground))]">
                <BadgeCheck className="size-7" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Return verified
              </h2>
              <p className="text-sm text-muted-foreground">
                Report #{result.reportId} was marked returned on{" "}
                {formatDateTime(result.returnedAt)}. This code is now spent and
                cannot be used again.
              </p>
              <Button asChild variant="outline" className="rounded-lg bg-card">
                <Link
                  to="/items/$reportId"
                  params={{ reportId: result.reportId }}
                  data-ocid="return.view_button"
                >
                  View the report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {failure ? (
        <div data-ocid="error_state" className="mt-8">
          <EmptyState
            icon={XCircle}
            title="Code not accepted"
            description={failure}
          />
        </div>
      ) : null}
    </div>
  );
}
