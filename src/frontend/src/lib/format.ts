import { format, formatDistanceToNow } from "date-fns";

/**
 * Motoko `Time.now()` values are nanosecond bigints. Convert through this
 * helper before any JavaScript Date operation.
 */
export function timestampToDate(
  timestamp: bigint | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(timestamp: bigint | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date unavailable";
  return format(date, "d MMM yyyy");
}

export function formatDateTime(timestamp: bigint | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Date unavailable";
  return format(date, "d MMM yyyy, HH:mm");
}

export function formatRelative(timestamp: bigint | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown time";
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Convert a `YYYY-MM-DD` date input value to a nanosecond bigint timestamp. */
export function dateInputToTimestamp(value: string): bigint | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Convert a nanosecond bigint timestamp to a `YYYY-MM-DD` input value. */
export function timestampToDateInput(
  timestamp: bigint | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

export function formatScore(score: bigint): string {
  return `${Number(score)}%`;
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
