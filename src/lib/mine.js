const STORAGE_KEY = "lostlink.managementCodes";

/** Read the management codes this browser has earned by reporting items. */
export function readCodes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && entry.id && entry.code);
  } catch {
    return [];
  }
}

/** Remember a code so the reporter can find, edit or withdraw the report later. */
export function saveCode(entry) {
  if (typeof window === "undefined") return;
  try {
    const next = readCodes().filter((item) => item.id !== entry.id);
    next.unshift({ id: entry.id, code: entry.code, title: entry.title, kind: entry.kind });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)));
  } catch {
    // Storage can be blocked (private browsing, embedded preview). The report is saved
    // either way, so this must never make the submit look like it failed — the code is
    // still shown on the success screen.
  }
}

export function removeCode(id) {
  if (typeof window === "undefined") return;
  try {
    const next = readCodes().filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Same as saveCode: the list simply stays as it was.
  }
}