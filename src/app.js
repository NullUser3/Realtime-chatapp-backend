import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import passport from "passport";

import index from "./routes/index.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import chatRoute from "./routes/chatRoute.js";
import authRoute from "./routes/authRoute.js";

import { httpsErrors } from "../errors/httpsErrors.js";
import "./config/google.js";

import { apiLimiter } from "./middleware/authLimiter.js";

const app = express();

// ---------------------------
// Trust proxy (important for cookies & rate limiting)
// ---------------------------
app.set("trust proxy", 1);

// ---------------------------
// Middleware
// ---------------------------

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"], // your API domain
        fontSrc: ["'self'"],
      },
    },
  })
);

// Enable compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Passport
app.use(passport.initialize());

// ---------------------------
// Routes with rate limiters
// ---------------------------

// Global API limiter per route group
app.use("/users", apiLimiter, userRoute);
app.use("/messages", apiLimiter, messageRoute);
app.use("/chat", apiLimiter, chatRoute);
app.use("/auth", apiLimiter, authRoute);

// Default index route (optional)
app.use("/", index);

// ---------------------------
// 404 handler
// ---------------------------
app.use((req, res, next) => {
  next(
    new httpsErrors(404, `Route ${req.method} ${req.originalUrl} not found`)
  );
});

// ---------------------------
// Global error handler
// ---------------------------
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    success: false,
    message: err.message || "Internal server error",
    status,
    path: req.originalUrl,
    method: req.method,
  };

  // Show stack trace only in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
});

export default app;