const DATE_LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

export function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Date unavailable";
  return date.toLocaleDateString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "Time unavailable";
  return date.toLocaleString(DATE_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}

export function relativeTime(value) {
  const date = toDate(value);
  if (!date) return "Unknown";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(value);
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function formatScore(score) {
  return `${Math.round(Number(score) || 0)}%`;
}