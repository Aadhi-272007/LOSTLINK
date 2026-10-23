import type { ContactInfo } from "@/backend";

/**
 * Private contact details are never returned by the public report API, so the
 * reporter's own browser remembers them locally, keyed by management code.
 * This lets the edit form prefill real values instead of overwriting stored
 * contact data with placeholders.
 */
const STORAGE_KEY = "lostlink.contactDetails";

type ContactCache = Record<string, ContactInfo>;

function readCache(): ContactCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ContactCache) : {};
  } catch {
    return {};
  }
}

export function saveContactForCode(code: string, contact: ContactInfo): void {
  if (typeof window === "undefined" || !code) return;
  try {
    const cache = readCache();
    cache[code] = contact;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage may be unavailable (private mode); editing still works.
  }
}

export function loadContactForCode(code: string): ContactInfo | null {
  if (!code) return null;
  const contact = readCache()[code];
  return contact ?? null;
}
