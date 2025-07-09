import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import rTracer from "cls-rtracer";
import expressWinston from 'express-winston';
import winston from 'winston';
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";
import { connectToDatabase } from './config/database';
import { LoadDataConfig } from './config/constant';
import loggerFormatter from './logger/loggerFormatter';
import expressBasicAuth from 'express-basic-auth';
import swaggerUi from "swagger-ui-express";
import swaggerDocument from './swagger/swagger';
import { SocketService } from './services/socket.service';
import { startCronJobs } from './cron/BackupLeaderboard';

import apiRouter from './routes';

dotenv.config();
const port = process.env.SV_HTTP_PORT || 5000;

const prefixPath = path.resolve(__dirname).includes(".server") ? "../" : "";
const loggerBlacklist = [
  "authorization",
  "signature",
  "token",
  "password",
  "secret",
];
const loggerRoutes = [
  "config",
  "users",
  "friends",
  "tutorial",
  "achievement",
  "quest",
  "leaderboard",
  "coupon",
];

// Limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 400,
  message: "Too many connection",
});

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "200mb" }));
app.set("json spaces", 2);
app.use(rTracer.expressMiddleware());
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(loggerFormatter, winston.format.colorize()),
  })
);
app.use(
  expressWinston.logger({
    level: "info",
    transports: [
      //new winston.transports.Console(),
      /*new winston.transports.File({
        filename: `${prefixPath}logs/request.log`,
        maxFiles: 15,
        maxsize: 51200,
      }),*/
      new DailyRotateFile({
        filename: `${prefixPath}logs/%DATE%_request.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: process.env.MAX_LOG_FILES,
      }),
    ],
    format: winston.format.combine(loggerFormatter, winston.format.colorize()),
    meta: true,
    msg: "Handle request",
    expressFormat: true,
    headerBlacklist: loggerBlacklist,
    bodyBlacklist: loggerBlacklist,
    colorize: true,
    ignoreRoute(req, res) {
      return !loggerRoutes.some((v) => req.path.includes(v));
    },
  })
);

// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);
app.use('/api', apiRouter);

// Swagger Docs
app.use(
  "/swagger-ui.html",
  expressBasicAuth({
    users: { ncc: "dev" },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);


app.get('/', (_req, res) => {
  res.send('Welcome to BestGuess!');
});

connectToDatabase()
  .then(() => {
    LoadDataConfig();
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      SocketService.instance.start();
      startCronJobs();
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB:', err);
    process.exit(1);
  });