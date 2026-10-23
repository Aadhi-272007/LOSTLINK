import { ReportKind } from "@/backend";
import { QrCard } from "@/components/common/QrCard";
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
import { useSubmitReport } from "@/hooks/use-backend";
import { validatePhoto } from "@/lib/backend-client";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { saveContactForCode } from "@/lib/contact-cache";
import { dateInputToTimestamp } from "@/lib/format";
import { uploadPhoto } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ReportSearch {
  kind?: ReportKind;
}

interface FormState {
  title: string;
  description: string;
  category: string;
  location: string;
  holdingLocation: string;
  occurredAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  location: "",
  holdingLocation: "",
  occurredAt: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

export function ReportPage() {
  const search = useSearch({ strict: false }) as ReportSearch;
  const navigate = useNavigate();
  const submitReport = useSubmitReport();

  const [kind, setKind] = useState<ReportKind>(search.kind ?? ReportKind.lost);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [result, setResult] = useState<{
    code: string;
    reportId: string;
    title: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLost = kind === ReportKind.lost;

  const selectKind = (next: ReportKind) => {
    setKind(next);
    void navigate({
      to: "/report",
      search: { kind: next },
      replace: true,
    });
  };

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validatePhoto(file);
    if (error) {
      toast.error(error);
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim())
      next.title = "Give your report a short, clear title.";
    if (form.description.trim().length < 20)
      next.description = "Add at least 20 characters so matching can work.";
    if (!form.category) next.category = "Choose a category.";
    if (!form.location) next.location = "Choose where this happened.";
    if (!form.occurredAt)
      next.occurredAt = isLost
        ? "Choose the date you lost it."
        : "Choose the date you found it.";
    if (!form.contactName.trim())
      next.contactName = "We need a name for the private contact record.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim()))
      next.contactEmail = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    let photoUrl: string | undefined;
    if (photo) {
      try {
        setUploadProgress(0);
        photoUrl = await uploadPhoto(photo, (pct) => setUploadProgress(pct));
      } catch (error) {
        setUploadProgress(null);
        const detail =
          error instanceof Error && error.message ? ` (${error.message})` : "";
        toast.error(
          `We couldn't upload your photo${detail}. You can submit without it and add it later.`,
        );
        return;
      }
      setUploadProgress(null);
    }

    submitReport.mutate(
      {
        kind,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location,
        holdingLocation: isLost
          ? undefined
          : form.holdingLocation.trim() || undefined,
        occurredAt: dateInputToTimestamp(form.occurredAt) ?? 0n,
        photo: photoUrl,
        contact: {
          name: form.contactName.trim(),
          email: form.contactEmail.trim(),
          phone: form.contactPhone.trim() || undefined,
        },
      },
      {
        onSuccess: (data) => {
          saveContactForCode(data.managementCode, {
            name: form.contactName.trim(),
            email: form.contactEmail.trim(),
            phone: form.contactPhone.trim() || undefined,
          });
          setResult({
            code: data.managementCode,
            reportId: data.report.id.toString(),
            title: data.report.title,
          });
          setForm(EMPTY_FORM);
          clearPhoto();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "We couldn't submit your report.",
          );
        },
      },
    );
  };

  const copyCode = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      toast.success("Management code copied.");
    } catch {
      toast.error("Copy failed — please select and copy the code manually.");
    }
  };

  /* ---------------- Success confirmation ---------------- */
  if (result) {
    const detailUrl = `${window.location.origin}/items/${result.reportId}`;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div data-ocid="success_state" className="space-y-8 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[oklch(var(--status-approved-bg))] text-[oklch(var(--status-approved-foreground))]">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Report submitted
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
              “{result.title}” is now on the board. Save your private management
              code — it is the only way to edit or withdraw this report later.
            </p>
          </div>

          <Card className="mx-auto max-w-md rounded-xl border-border shadow-subtle">
            <CardContent className="space-y-3 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Private management code
              </p>
              <p
                data-ocid="success.management_code"
                className="break-all rounded-lg bg-muted px-4 py-3 font-mono text-lg font-semibold tracking-wide text-foreground"
              >
                {result.code}
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="success.copy_button"
                className="w-full rounded-lg"
                onClick={copyCode}
              >
                <Copy className="size-4" aria-hidden="true" />
                Copy code
              </Button>
            </CardContent>
          </Card>

          <div className="mx-auto max-w-xs">
            <QrCard
              value={detailUrl}
              title={result.title}
              caption="Scan to open this report"
              filename={`lostlink-report-${result.reportId}`}
            />
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-lg shadow-elevated">
              <Link
                to="/items/$reportId"
                params={{ reportId: result.reportId }}
                data-ocid="success.view_button"
              >
                View report
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg bg-card">
              <Link to="/my-reports" data-ocid="success.my_reports_button">
                Go to My Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Form ---------------- */
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 rounded-lg text-muted-foreground"
      >
        <Link to="/" data-ocid="report.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
      </Button>

      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Report an item
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {isLost ? "Report a lost item" : "Report a found item"}
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          No account needed. Your contact details stay private and are only
          shared through an approved claim.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8" noValidate>
        {/* Kind toggle */}
        <div className="grid grid-cols-2 gap-3">
          {[ReportKind.lost, ReportKind.found].map((option) => (
            <button
              key={option}
              type="button"
              data-ocid={`report.kind_${option}_button`}
              onClick={() => selectKind(option)}
              aria-pressed={kind === option}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium transition-smooth",
                kind === option
                  ? "border-primary bg-primary/5 text-foreground shadow-subtle"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option === ReportKind.lost
                ? "I lost something"
                : "I found something"}
            </button>
          ))}
        </div>

        {/* Details */}
        <Card className="rounded-xl border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-lg">Item details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="report-title">Title</Label>
              <Input
                id="report-title"
                data-ocid="report.title_input"
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="e.g. Navy blue backpack with laptop sleeve"
                aria-invalid={Boolean(errors.title)}
                className="rounded-lg"
              />
              {errors.title ? (
                <p
                  data-ocid="report.title_error"
                  className="text-sm text-destructive"
                >
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                data-ocid="report.description_textarea"
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="Colour, brand, distinguishing marks, contents — anything that helps identify it."
                aria-invalid={Boolean(errors.description)}
                className="min-h-28 rounded-lg"
              />
              {errors.description ? (
                <p
                  data-ocid="report.description_error"
                  className="text-sm text-destructive"
                >
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setField("category", value)}
                >
                  <SelectTrigger
                    id="report-category"
                    data-ocid="report.category_select"
                    aria-invalid={Boolean(errors.category)}
                    className="w-full rounded-lg"
                  >
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category ? (
                  <p
                    data-ocid="report.category_error"
                    className="text-sm text-destructive"
                  >
                    {errors.category}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-location">
                  {isLost ? "Last seen at" : "Found at"}
                </Label>
                <Select
                  value={form.location}
                  onValueChange={(value) => setField("location", value)}
                >
                  <SelectTrigger
                    id="report-location"
                    data-ocid="report.location_select"
                    aria-invalid={Boolean(errors.location)}
                    className="w-full rounded-lg"
                  >
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location ? (
                  <p
                    data-ocid="report.location_error"
                    className="text-sm text-destructive"
                  >
                    {errors.location}
                  </p>
                ) : null}
              </div>
            </div>

            {!isLost ? (
              <div className="space-y-2">
                <Label htmlFor="report-holding">
                  Where is it being held now?
                </Label>
                <Input
                  id="report-holding"
                  data-ocid="report.holding_input"
                  value={form.holdingLocation}
                  onChange={(event) =>
                    setField("holdingLocation", event.target.value)
                  }
                  placeholder="e.g. Student Union front desk"
                  className="rounded-lg"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="report-date">
                {isLost ? "Date lost" : "Date found"}
              </Label>
              <Input
                id="report-date"
                type="date"
                data-ocid="report.date_input"
                value={form.occurredAt}
                onChange={(event) => setField("occurredAt", event.target.value)}
                aria-invalid={Boolean(errors.occurredAt)}
                className="rounded-lg sm:max-w-xs"
              />
              {errors.occurredAt ? (
                <p
                  data-ocid="report.date_error"
                  className="text-sm text-destructive"
                >
                  {errors.occurredAt}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card className="rounded-xl border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Photo (optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img
                  src={photoPreview}
                  alt="Selected item preview"
                  className="max-h-64 w-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  data-ocid="report.remove_photo_button"
                  aria-label="Remove photo"
                  className="absolute right-3 top-3 rounded-lg"
                  onClick={clearPhoto}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="report.upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-smooth hover:border-primary/40 hover:bg-muted/50"
              >
                <ImagePlus className="size-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">
                  Add a photo
                </span>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, or GIF up to 8 MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              data-ocid="report.photo_input"
              className="sr-only"
              onChange={handlePhotoChange}
            />
            {uploadProgress !== null ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading photo…</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="rounded-xl border-border shadow-subtle">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Private contact details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              These details are never shown publicly. They are only revealed to
              the person whose claim is approved.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-name">Your name</Label>
                <Input
                  id="report-name"
                  data-ocid="report.contact_name_input"
                  value={form.contactName}
                  onChange={(event) =>
                    setField("contactName", event.target.value)
                  }
                  aria-invalid={Boolean(errors.contactName)}
                  className="rounded-lg"
                />
                {errors.contactName ? (
                  <p
                    data-ocid="report.contact_name_error"
                    className="text-sm text-destructive"
                  >
                    {errors.contactName}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-email">Email</Label>
                <Input
                  id="report-email"
                  type="email"
                  data-ocid="report.contact_email_input"
                  value={form.contactEmail}
                  onChange={(event) =>
                    setField("contactEmail", event.target.value)
                  }
                  aria-invalid={Boolean(errors.contactEmail)}
                  className="rounded-lg"
                />
                {errors.contactEmail ? (
                  <p
                    data-ocid="report.contact_email_error"
                    className="text-sm text-destructive"
                  >
                    {errors.contactEmail}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-phone">Phone (optional)</Label>
              <Input
                id="report-phone"
                data-ocid="report.contact_phone_input"
                value={form.contactPhone}
                onChange={(event) =>
                  setField("contactPhone", event.target.value)
                }
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
            <Link to="/" data-ocid="report.cancel_button">
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            data-ocid="report.submit_button"
            className="rounded-lg shadow-elevated"
            disabled={submitReport.isPending || uploadProgress !== null}
          >
            {submitReport.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              <>
                Submit report
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
