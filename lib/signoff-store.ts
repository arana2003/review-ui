// Sign-off history kept in the browser's localStorage, so it survives reloads.

export type HistoryEntry = {
  at: string;
  documentId: string;
  action: string;
  ok: boolean;
  detail: string;
};

const KEY = "review-ui:signoff-history";
const MAX_ENTRIES = 200;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the entry still shows for this page view.
  }
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore: nothing to clear if storage is unavailable.
  }
}
