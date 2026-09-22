import cron from "node-cron";
import { runDailyReport } from "../services/dailyReport.service";

const CRON_EXPR = "59 23 * * *";
const TZ = "Asia/Jakarta";

/**
 * REQ-REPORT-01/02: schedule daily aggregation at 23:59 Asia/Jakarta.
 * Callback is async I/O only — does not block request handling.
 */
export function startDailyReportCron(): void {
  if (!cron.validate(CRON_EXPR)) {
    console.error(`[daily-report] invalid cron expression: ${CRON_EXPR}`);
    return;
  }

  cron.schedule(
    CRON_EXPR,
    () => {
      // Defer off the cron tick so the timer/callback path stays non-blocking.
      setImmediate(() => {
        void runDailyReport()
          .then(({ dayLabel, totalRevenue, orderCount }) => {
            console.log(
              `[daily-report] ok date=${dayLabel} revenue=${totalRevenue.toString()} orders=${orderCount}`
            );
          })
          .catch((err: unknown) => {
            console.error("[daily-report] failed", err);
          });
      });
    },
    { timezone: TZ }
  );

  console.log(`[daily-report] cron scheduled "${CRON_EXPR}" tz=${TZ}`);
}
