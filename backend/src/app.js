import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import env from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import materialIssueRoutes from "./routes/materialIssue.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import workerAssignmentRoutes from "./routes/workerAssignment.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: "Too many requests, please try again later." },
  });
  app.use("/api/", limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many auth attempts, please try again later." },
  });
  app.use("/api/v1/auth/", authLimiter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.nodeEnv === "development") {
    app.use(morgan("dev"));
  }

  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "SiteOS API is running",
      version: "1.0.0",
      environment: env.nodeEnv,
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "API healthy", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/projects", projectRoutes);
  app.use("/api/v1/tasks", taskRoutes);
  app.use("/api/v1/workers", workerRoutes);
  app.use("/api/v1/inventory", inventoryRoutes);
  app.use("/api/v1/vendors", vendorRoutes);
  app.use("/api/v1/procurement", procurementRoutes);
  app.use("/api/v1/material-issues", materialIssueRoutes);
  app.use("/api/v1/attendance", attendanceRoutes);
  app.use("/api/v1/worker-assignments", workerAssignmentRoutes);
  app.use("/api/v1/finance", financeRoutes);
  app.use("/api/v1/leaves", leaveRoutes);
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
