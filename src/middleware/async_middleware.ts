import { Request, Response, NextFunction, RequestHandler } from "express";

import * as dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || "development";

/**
 * Wraps an async Express middleware or route handler to catch errors and forward to next()
 * @param middleware Async middleware function
 * @returns Wrapped middleware with error handling
 */
const asyncMiddleware = (middleware: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await middleware(req, res, next);
    } catch (err) {
      if (env === "development") {
        console.error("Caught async error:", err);
      }
      next(err);
    }
  };
};

export default asyncMiddleware;
