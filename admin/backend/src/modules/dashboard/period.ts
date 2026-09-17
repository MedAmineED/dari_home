/**
 * Pure date-window + bucketing helpers for the dashboard. Kept framework-free
 * so the window boundaries and chart buckets can be unit-tested without a DB.
 * All boundaries are computed in UTC for determinism (single-region shop).
 */
export type Period = 'all' | 'year' | 'month' | 'week' | 'day';

export interface DateRange {
  from: Date | null; // null = no lower bound (all time)
  to: Date;
}

export interface OrderPoint {
  createdAt: Date;
  totalAmount: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
const startOfDayUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** The [from, to] window a period covers, ending at `now`. */
export function periodRange(period: Period, now: Date): DateRange {
  switch (period) {
    case 'day':
      return { from: startOfDayUTC(now), to: now };
    case 'week':
      return { from: new Date(startOfDayUTC(now).getTime() - 6 * DAY_MS), to: now };
    case 'month':
      return {
        from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        to: now,
      };
    case 'year':
      return { from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), to: now };
    case 'all':
    default:
      return { from: null, to: now };
  }
}

interface Bucket {
  label: string;
  key: string;
  value: number;
}

/** Which bucket a date falls into, for the given period's granularity. */
function keyOf(d: Date, period: Period): string {
  switch (period) {
    case 'day':
      return pad(d.getUTCHours());
    case 'week':
    case 'month':
      return pad(d.getUTCDate());
    case 'year':
      return pad(d.getUTCMonth() + 1);
    case 'all':
    default:
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  }
}

/** The ordered, zero-filled bucket grid for a period. */
function grid(period: Period, now: Date, orders: OrderPoint[]): Bucket[] {
  const b: Bucket[] = [];
  const push = (label: string) => b.push({ label, key: label, value: 0 });

  if (period === 'day') {
    for (let h = 0; h < 24; h++) push(pad(h));
  } else if (period === 'week') {
    const start = new Date(startOfDayUTC(now).getTime() - 6 * DAY_MS);
    for (let i = 0; i < 7; i++) {
      push(pad(new Date(start.getTime() + i * DAY_MS).getUTCDate()));
    }
  } else if (period === 'month') {
    const days = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
    ).getUTCDate();
    for (let day = 1; day <= days; day++) push(pad(day));
  } else if (period === 'year') {
    for (let m = 1; m <= 12; m++) push(pad(m));
  } else {
    // all: month buckets from the earliest order to now
    if (orders.length === 0) return [];
    let min = orders[0].createdAt;
    for (const o of orders) if (o.createdAt < min) min = o.createdAt;
    let y = min.getUTCFullYear();
    let m = min.getUTCMonth();
    const ey = now.getUTCFullYear();
    const em = now.getUTCMonth();
    while (y < ey || (y === ey && m <= em)) {
      push(`${y}-${pad(m + 1)}`);
      if (++m > 11) {
        m = 0;
        y++;
      }
    }
  }
  return b;
}

/**
 * Sum order revenue into the period's bucket grid. Orders must already be
 * filtered to the window (and to DELIVERED) by the caller.
 */
export function bucketRevenue(
  orders: OrderPoint[],
  period: Period,
  now: Date,
): RevenuePoint[] {
  const buckets = grid(period, now, orders);
  const byKey = new Map(buckets.map((x) => [x.key, x]));
  for (const o of orders) {
    const bucket = byKey.get(keyOf(o.createdAt, period));
    if (bucket) bucket.value += o.totalAmount;
  }
  return buckets.map(({ label, value }) => ({
    label,
    value: Math.round(value * 100) / 100,
  }));
}
