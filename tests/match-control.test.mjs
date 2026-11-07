import test from "node:test";
import assert from "node:assert/strict";
import { clockLabel, defaultMatchRules, dimAt, OVERTIME_RATE, overtimeMinutes, scheduledTimes } from "../lib/match-control.mjs";

test("overtime charges for each started minute after scheduled end", () => {
  const end = 1_000_000;
  assert.equal(OVERTIME_RATE, 50);
  assert.equal(overtimeMinutes(end, end - 1), 0);
  assert.equal(overtimeMinutes(end, end), 0);
  assert.equal(overtimeMinutes(end, end + 1), 1);
  assert.equal(overtimeMinutes(end, end + 60_000), 1);
  assert.equal(overtimeMinutes(end, end + 60_001), 2);
});

test("dimming is scheduled relative to booking end", () => {
  const end = 1_000_000;
  assert.equal(dimAt(end, defaultMatchRules), end - 5 * 60_000);
  assert.equal(dimAt(end, { ...defaultMatchRules, dimTiming: "after", dimMinutes: 10 }), end + 10 * 60_000);
  assert.equal(dimAt(end, { ...defaultMatchRules, dimMinutes: 0 }), end);
});

test("booking end follows the scheduled hour and clock formats long durations", () => {
  const { start, end } = scheduledTimes({ date: "2026-11-07", hour: 22 });
  assert.equal(end - start, 3_600_000);
  assert.equal(clockLabel(61_000), "01:01");
  assert.equal(clockLabel(3_661_000), "1:01:01");
});
