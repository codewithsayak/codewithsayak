import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readActivity } from '../server/activity.js';

test('serves the verified contribution snapshot, not a live counter', () => {
  const activity = readActivity();
  assert.equal(activity.total, 37);
  assert.equal(activity.isLive, false);
  assert.equal(activity.capturedAt, '2026-10-25');
  const days = activity.weeks.flatMap((week) => week.contributionDays);
  assert.equal(days.reduce((sum, day) => sum + day.count, 0), activity.total);
});

test('refuses a snapshot whose daily cells disagree with the stated total', () => {
  const dir = mkdtempSync(join(tmpdir(), 'activity-test-'));
  const file = join(dir, 'bad.json');
  writeFileSync(file, JSON.stringify({ total_contributions: 99, captured_at_utc: '2026-10-25', weeks: [{ contributionDays: [{ date: '2026-10-25', count: 1 }] }] }));
  try {
    assert.throws(() => readActivity(pathToFileURL(file)), /totals do not match/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('refuses invalid daily counts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'activity-test-'));
  const file = join(dir, 'bad.json');
  writeFileSync(file, JSON.stringify({ total_contributions: -1, captured_at_utc: '2026-10-25', weeks: [{ contributionDays: [{ date: '2026-10-25', count: -1 }] }] }));
  try {
    assert.throws(() => readActivity(pathToFileURL(file)), /invalid daily data/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
