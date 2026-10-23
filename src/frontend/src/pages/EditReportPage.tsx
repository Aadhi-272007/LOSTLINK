import { ReportKind } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { DetailSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEditReport, useReport } from "@/hooks/use-backend";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { loadContactForCode } from "@/lib/contact-cache";
import { dateInputToTimestamp, timestampToDateInput } from "@/lib/format";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditSearch {
  code?: string;
}

export function EditReportPage() {
  const { reportId } = useParams({ strict: false }) as { reportId: string };
  const search = useSearch({ strict: false }) as EditSearch;
  const navigate = useNavigate();
  const id = reportId ? BigInt(reportId) : undefined;
  const code = search.code ?? "";

  const { data: report, isLoading, isError } = useReport(id);
  const editReport = useEditReport();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [holdingLocation, setHoldingLocation] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [contactKnown, setContactKnown] = useState(false);

  // One-time initialization from the loaded report — never overwrite a draft.
  useEffect(() => {
    if (!report || initialized) return;
    setTitle(report.title);
    setDescription(report.description);
    setCategory(report.category);
    setLocation(report.location);
    setHoldingLocation(report.holdingLocation ?? "");
    setOccurredAt(timestampToDateInput(report.occurredAt));
    const cached = loadContactForCode(code);
    if (cached) {
      setContactName(cached.name);
      setContactEmail(cached.email);
      setContactPhone(cached.phone ?? "");
      setContactKnown(true);
    }
    setInitialized(true);
  }, [report, initialized, code]);

  if (!code) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          data-ocid="error_state"
          title="Management code required"
          description="Editing a report needs the private management code you received when you submitted it."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/my-reports">Go to My Reports</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <EmptyState
          data-ocid="error_state"
          title="Report not found"
          description="This report may have been withdrawn or removed."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/my-reports">Back to My Reports</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isLost = report.kind === ReportKind.lost;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !title.trim() ||
      description.trim().length < 20 ||
      !category ||
      !location ||
      !occurredAt
    ) {
      toast.error(
        "Please complete the title, description, category, location, and date.",
      );
      return;
    }
    if (!contactKnown) {
      toast.error(
        "We can't load your private contact details in this browser, so saving would overwrite them. Open My Reports in the browser you used to submit the report, or submit a new report.",
      );
      return;
    }
    if (
      !contactName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())
    ) {
      toast.error("Please provide a valid contact name and email.");
      return;
    }
    editReport.mutate(
      {
        id: report.id,
        code,
        edit: {
          title: title.trim(),
          description: description.trim(),
          category,
          location,
          holdingLocation: isLost
            ? undefined
            : holdingLocation.trim() || undefined,
          occurredAt: dateInputToTimestamp(occurredAt) ?? report.occurredAt,
          photo: report.photo,
          contact: {
            name: contactName.trim(),
            email: contactEmail.trim(),
            phone: contactPhone.trim() || undefined,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Report updated.");
          void navigate({
            to: "/items/$reportId",
            params: { reportId: report.id.toString() },
          });
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "We couldn't save your changes.",
          ),
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 rounded-lg text-muted-foreground"
      >
        <Link to="/my-reports" data-ocid="edit.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to My Reports
        </Link>
      </Button>

      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Edit report
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Update “{report.title}”
        </h1>
        <p className="text-base text-muted-foreground">
          Changes are saved against your management code and appear on the
          public report immediately.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <Card className="rounded-xl border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-lg">Item details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                data-ocid="edit.title_input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                data-ocid="edit.description_textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28 rounded-lg"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="edit-category"
                    data-ocid="edit.category_select"
                    className="w-full rounded-lg"
                  >
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">
                  {isLost ? "Last seen at" : "Found at"}
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger
                    id="edit-location"
                    data-ocid="edit.location_select"
                    className="w-full rounded-lg"
                  >
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isLost ? (
              <div className="space-y-2">
                <Label htmlFor="edit-holding">
                  Where is it being held now?
                </Label>
                <Input
                  id="edit-holding"
                  data-ocid="edit.holding_input"
                  value={holdingLocation}
                  onChange={(event) => setHoldingLocation(event.target.value)}
                  className="rounded-lg"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-date">
                {isLost ? "Date lost" : "Date found"}
              </Label>
              <Input
                id="edit-date"
                type="date"
                data-ocid="edit.date_input"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                className="rounded-lg sm:max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Private contact details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {!contactKnown ? (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground sm:col-span-2">
                Your private contact details aren't available in this browser,
                so they can't be edited here without overwriting them. Open My
                Reports in the browser you used to submit the report to edit
                them.
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Your name</Label>
              <Input
                id="edit-name"
                data-ocid="edit.contact_name_input"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                disabled={!contactKnown}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                data-ocid="edit.contact_email_input"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                disabled={!contactKnown}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-phone">Phone (optional)</Label>
              <Input
                id="edit-phone"
                data-ocid="edit.contact_phone_input"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                disabled={!contactKnown}
                className="rounded-lg sm:max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
            className="rounded-lg bg-card"
          >
            <Link to="/my-reports" data-ocid="edit.cancel_button">
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            data-ocid="edit.save_button"
            className="rounded-lg shadow-elevated"
            disabled={editReport.isPending}
          >
            {editReport.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
