import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import writingRoutes from "./routes/writing.routes.js";
import mistakeRoutes from "./routes/mistake.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import vocabularyRoutes from "./routes/vocabulary.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import speakingRoutes from "./routes/speaking.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import placementRoutes from "./routes/placement.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.clientUrl.split(",").map((u) => u.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  })
);

// stricter rate limit for AI-heavy endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please slow down." },
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/writing", aiLimiter, writingRoutes);
app.use("/api/mistakes", mistakeRoutes);
app.use("/api/practice", aiLimiter, practiceRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/chat", aiLimiter, chatRoutes);
app.use("/api/speaking", aiLimiter, speakingRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;