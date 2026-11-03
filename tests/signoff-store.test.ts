import { beforeEach, describe, expect, it } from "vitest";
import { type HistoryEntry, appendHistory, clearHistory, loadHistory } from "@/lib/signoff-store";

const entry = (n: number): HistoryEntry => ({
  at: `2026-11-03T13:0${n}:00.000Z`,
  documentId: "PKT-0001",
  action: "Approved",
  ok: true,
  detail: `entry ${n}`,
});

describe("sign-off history store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty list when nothing has been saved", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("keeps the newest entry first and survives a reload", () => {
    appendHistory(entry(1));
    appendHistory(entry(2));
    const loaded = loadHistory();
    expect(loaded.map((e) => e.detail)).toEqual(["entry 2", "entry 1"]);
  });

  it("caps the history at 200 entries", () => {
    for (let i = 0; i < 205; i++) appendHistory({ ...entry(1), detail: `e${i}` });
    expect(loadHistory()).toHaveLength(200);
    expect(loadHistory()[0].detail).toBe("e204");
  });

  it("clears saved history", () => {
    appendHistory(entry(1));
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it("returns an empty list when the stored value is corrupt", () => {
    window.localStorage.setItem("review-ui:signoff-history", "{not json");
    expect(loadHistory()).toEqual([]);
  });
});
