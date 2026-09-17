import {
  bucketRevenue,
  periodRange,
  type OrderPoint,
} from './period';

const utc = (iso: string) => new Date(iso);
const NOW = utc('2026-09-17T14:30:00.000Z');

describe('periodRange', () => {
  it('day = since UTC midnight today', () => {
    const r = periodRange('day', NOW);
    expect(r.from?.toISOString()).toBe('2026-09-17T00:00:00.000Z');
    expect(r.to).toBe(NOW);
  });
  it('week = last 7 days (incl today) from UTC midnight', () => {
    expect(periodRange('week', NOW).from?.toISOString()).toBe(
      '2026-09-11T00:00:00.000Z',
    );
  });
  it('month = first of the current month', () => {
    expect(periodRange('month', NOW).from?.toISOString()).toBe(
      '2026-09-01T00:00:00.000Z',
    );
  });
  it('year = first of January', () => {
    expect(periodRange('year', NOW).from?.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
  });
  it('all = no lower bound', () => {
    expect(periodRange('all', NOW).from).toBeNull();
  });
});

describe('bucketRevenue', () => {
  it('year → 12 month buckets, summed by month', () => {
    const orders: OrderPoint[] = [
      { createdAt: utc('2026-01-15T10:00:00Z'), totalAmount: 100 },
      { createdAt: utc('2026-01-20T10:00:00Z'), totalAmount: 50 },
      { createdAt: utc('2026-03-02T10:00:00Z'), totalAmount: 30 },
    ];
    const b = bucketRevenue(orders, 'year', NOW);
    expect(b).toHaveLength(12);
    expect(b[0]).toEqual({ label: '01', value: 150 });
    expect(b[2]).toEqual({ label: '03', value: 30 });
    expect(b[1]).toEqual({ label: '02', value: 0 });
  });

  it('day → 24 hour buckets, summed by UTC hour', () => {
    const orders: OrderPoint[] = [
      { createdAt: utc('2026-09-17T09:30:00Z'), totalAmount: 20 },
      { createdAt: utc('2026-09-17T09:45:00Z'), totalAmount: 5 },
    ];
    const b = bucketRevenue(orders, 'day', NOW);
    expect(b).toHaveLength(24);
    expect(b[9]).toEqual({ label: '09', value: 25 });
  });

  it('month → one bucket per day of the month', () => {
    const b = bucketRevenue(
      [{ createdAt: utc('2026-09-03T08:00:00Z'), totalAmount: 40 }],
      'month',
      NOW,
    );
    expect(b).toHaveLength(30); // September
    expect(b[2]).toEqual({ label: '03', value: 40 });
  });

  it('empty orders still returns the zero-filled grid', () => {
    expect(bucketRevenue([], 'year', NOW)).toHaveLength(12);
    expect(bucketRevenue([], 'year', NOW).every((p) => p.value === 0)).toBe(true);
  });
});
