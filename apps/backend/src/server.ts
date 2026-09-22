import "dotenv/config";
import http from "http";
import express from "express";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { initSocketServer } from "./realtime/socket";
import { startDailyReportCron } from "./jobs/dailyReport.cron";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

app.use(errorHandler);

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`laundry-backend listening on http://localhost:${env.port}`);
  console.log(`socket.io ready on same port`);
  startDailyReportCron();
});
