import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const JAKARTA_TZ = "Asia/Jakarta";

type AggregateRow = {
  total_revenue: Prisma.Decimal;
  order_count: number;
};

/**
 * Calendar day bounds in Asia/Jakarta as half-open [start, end) in UTC instants.
 */
export function jakartaDayBounds(reference: Date = new Date()): {
  reportDate: Date;
  start: Date;
  end: Date;
  dayLabel: string;
} {
  const dayLabel = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);

  // Asia/Jakarta is UTC+7 year-round (no DST).
  const start = new Date(`${dayLabel}T00:00:00+07:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  // DATE column: calendar date as midnight UTC (Prisma @db.Date)
  const reportDate = new Date(`${dayLabel}T00:00:00.000Z`);

  return { reportDate, start, end, dayLabel };
}

/**
 * Revenue rule (2B): sum(payments.amount) where status = 'paid';
 * day bucket = COALESCE(payments.paid_at, orders.created_at) in Asia/Jakarta.
 * Order count = number of such paid payments in that day.
 */
export async function aggregatePaidRevenueForDay(
  start: Date,
  end: Date
): Promise<{ totalRevenue: Prisma.Decimal; orderCount: number }> {
  const rows = await prisma.$queryRaw<AggregateRow[]>`
    SELECT
      COALESCE(SUM(p.amount), 0) AS total_revenue,
      COUNT(*)::int AS order_count
    FROM payments p
    INNER JOIN orders o ON o.id = p.order_id
    WHERE p.status = 'paid'
      AND COALESCE(p.paid_at, o.created_at) >= ${start}
      AND COALESCE(p.paid_at, o.created_at) < ${end}
  `;

  const row = rows[0];
  return {
    totalRevenue: new Prisma.Decimal(row?.total_revenue ?? 0),
    orderCount: Number(row?.order_count ?? 0),
  };
}

/**
 * Aggregates the Jakarta calendar day of `reference` (default: now) and upserts
 * into daily_reports. Safe to re-run for the same day (idempotent).
 */
export async function runDailyReport(reference: Date = new Date()) {
  const { reportDate, start, end, dayLabel } = jakartaDayBounds(reference);
  const { totalRevenue, orderCount } = await aggregatePaidRevenueForDay(
    start,
    end
  );

  const report = await prisma.dailyReport.upsert({
    where: { reportDate },
    create: {
      reportDate,
      totalRevenue,
      orderCount,
    },
    update: {
      totalRevenue,
      orderCount,
    },
  });

  return { report, dayLabel, totalRevenue, orderCount };
}
