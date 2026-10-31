import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";
import { validatePhoto, uploadPhoto } from "@/lib/upload";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-fast placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/20";
const labelClass = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export default function ReportForm({
  initial,
  kind,
  onKindChange,
  submitLabel = "Publish report",
  busy = false,
  error,
  onSubmit,
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    location: initial?.location ?? "",
    holding_location: initial?.holding_location ?? "",
    occurred_at: initial?.occurred_at ?? "",
    contact_name: initial?.contact_name ?? "",
    contact_email: initial?.contact_email ?? "",
    contact_phone: initial?.contact_phone ?? "",
    photo_url: initial?.photo_url ?? "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(initial?.photo_url ?? "");
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isLost = kind === "lost";

  const onPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      event.target.value = "";
      return;
    }
    setPhotoError(null);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPreview("");
    setForm((prev) => ({ ...prev, photo_url: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Give the item a short, clear name.";
    if (form.title.trim().length > 120) next.title = "Keep the title under 120 characters.";
    if (form.description.trim().length < 20)
      next.description = "Add at least 20 characters so matching can work.";
    if (form.description.trim().length > 2000)
      next.description = "Keep the description under 2000 characters.";
    if (!form.category) next.category = "Choose a category.";
    if (!form.location) next.location = "Choose where this happened.";
    if (!form.occurred_at) next.occurred_at = "Choose the date.";
    if (!form.contact_name.trim()) next.contact_name = "Who should staff contact?";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim()))
      next.contact_email = "Enter a valid email address.";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    let photoUrl = form.photo_url;
    if (photo) {
      setUploading(true);
      try {
        photoUrl = await uploadPhoto(photo);
      } catch {
        setUploading(false);
        setPhotoError("That photo couldn't be uploaded. Try again, or submit without it.");
        return;
      }
      setUploading(false);
    }

    await onSubmit({ ...form, photo_url: photoUrl || "" });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {onKindChange && (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/50 p-1.5">
          {["lost", "found"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onKindChange(option)}
              aria-pressed={kind === option}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition-fast ${
                kind === option
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I {option === "lost" ? "lost" : "found"} an item
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">The item</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Title</span>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder={isLost ? "Black AirPods Pro case with a sticker" : "Blue water bottle found in the library"}
              className={inputClass}
            />
            {errors.title && <span className="mt-1 block text-xs text-destructive">{errors.title}</span>}
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={4}
              placeholder="Colour, brand, marks, contents — anything that would identify it."
              className={`${inputClass} resize-none`}
            />
            {errors.description && (
              <span className="mt-1 block text-xs text-destructive">{errors.description}</span>
            )}
          </label>

          <label>
            <span className={labelClass}>Category</span>
            <select value={form.category} onChange={set("category")} className={inputClass}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="mt-1 block text-xs text-destructive">{errors.category}</span>
            )}
          </label>

          <label>
            <span className={labelClass}>{isLost ? "Where you lost it" : "Where you found it"}</span>
            <select value={form.location} onChange={set("location")} className={inputClass}>
              <option value="">Choose a location</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.location && (
              <span className="mt-1 block text-xs text-destructive">{errors.location}</span>
            )}
          </label>

          <label>
            <span className={labelClass}>Date</span>
            <input
              type="date"
              value={form.occurred_at}
              onChange={set("occurred_at")}
              max={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
            {errors.occurred_at && (
              <span className="mt-1 block text-xs text-destructive">{errors.occurred_at}</span>
            )}
          </label>

          {!isLost && (
            <label>
              <span className={labelClass}>Where it is now</span>
              <input
                value={form.holding_location}
                onChange={set("holding_location")}
                placeholder="e.g. Library front desk"
                className={inputClass}
              />
            </label>
          )}

          <div className="sm:col-span-2">
            <span className={labelClass}>Photo (optional)</span>
            <div className="mt-1.5 flex items-center gap-4">
              {preview ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                  <img src={preview} alt="Selected item" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 rounded-full bg-foreground/70 p-1 text-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-fast hover:border-primary/40 hover:text-primary"
                >
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[11px] font-medium">Add photo</span>
                </button>
              )}
              <div className="text-xs text-muted-foreground">
                <p>JPG, PNG or WebP, up to 5 MB.</p>
                <p className="mt-1">A photo makes matching much more reliable.</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className="hidden"
            />
            {photoError && <p className="mt-2 text-xs text-destructive">{photoError}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Your contact details</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Private. Only campus staff can see these — never shown on the public board.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Name</span>
            <input value={form.contact_name} onChange={set("contact_name")} className={inputClass} />
            {errors.contact_name && (
              <span className="mt-1 block text-xs text-destructive">{errors.contact_name}</span>
            )}
          </label>
          <label>
            <span className={labelClass}>Email</span>
            <input
              type="email"
              value={form.contact_email}
              onChange={set("contact_email")}
              className={inputClass}
            />
            {errors.contact_email && (
              <span className="mt-1 block text-xs text-destructive">{errors.contact_email}</span>
            )}
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Phone (optional)</span>
            <input
              value={form.contact_phone}
              onChange={set("contact_phone")}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || uploading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {(busy || uploading) && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {uploading ? "Uploading photo…" : submitLabel}
      </button>
    </form>
  );
}