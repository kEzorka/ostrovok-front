export const DAY_MS = 86_400_000;

/** Strict date-only parsing avoids rollover (February 30) and DST arithmetic. */
export function dateTimestamp(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
}

export function nextDay(value: string): string {
  return new Date(dateTimestamp(value)! + DAY_MS).toISOString().slice(0, 10);
}
