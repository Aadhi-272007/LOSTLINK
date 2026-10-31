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

const NOT_HELPFUL = /^(httperror|fetch failed|failed to fetch|internal server error|networkerror)$/i;

/**
 * Turn a failed save into a sentence that says what actually went wrong.
 * Falls back to the friendly line when the reason isn't something a reporter can act on.
 */
export function describeSaveError(error, fallback) {
  const issues =
    error?.issues ?? error?.cause?.issues ?? error?.cause?.cause?.issues ?? error?.data?.issues;
  if (Array.isArray(issues) && issues.length > 0) {
    const issue = issues[0];
    const field = Array.isArray(issue?.path) ? FIELD_LABELS[issue.path[0]] : undefined;
    if (field && issue.message) return `${fallback} ${field}: ${issue.message}.`;
    if (issue?.message) return `${fallback} ${issue.message}.`;
  }

  const message = typeof error?.message === "string" ? error.message.trim() : "";
  if (message && message.length <= 180 && !NOT_HELPFUL.test(message)) {
    return `${fallback} Details: ${message}`;
  }
  return fallback;
}