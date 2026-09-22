/**
 * One-shot runner for manual testing: npm run report:daily
 * Uses the same aggregation + upsert as the cron job.
 */
import "dotenv/config";
import { runDailyReport } from "../services/dailyReport.service";
import { prisma } from "../config/prisma";

async function main() {
  const result = await runDailyReport();
  console.log(
    `[daily-report] ok date=${result.dayLabel} revenue=${result.totalRevenue.toString()} orders=${result.orderCount} id=${result.report.id}`
  );
}

main()
  .catch((err: unknown) => {
    console.error("[daily-report] failed", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
