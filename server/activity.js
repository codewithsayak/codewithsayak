import { readFileSync } from 'node:fs';

export function readActivity(url = new URL('../shared/contributions-snapshot.json', import.meta.url)) {
  const snapshot = JSON.parse(readFileSync(url, 'utf8'));
  const days = snapshot.weeks.flatMap((week) => week.contributionDays);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  if (!Number.isInteger(snapshot.total_contributions) || total !== snapshot.total_contributions) {
    throw new Error('Contribution snapshot totals do not match.');
  }
  if (days.some((day) => !Number.isInteger(day.count) || day.count < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(day.date))) {
    throw new Error('Contribution snapshot contains invalid daily data.');
  }
  return {
    login: snapshot.login,
    capturedAt: snapshot.captured_at_utc,
    total: snapshot.total_contributions,
    weeks: snapshot.weeks,
    isLive: false,
    source: 'https://github.com/codewithsayak',
  };
}
