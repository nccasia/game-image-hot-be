import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import jwt, { JwtPayload } from "jsonwebtoken";
import User from '../models/User';

import dotenv from 'dotenv';
dotenv.config();

const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token =
    req.body?.token || req.query?.token || req.headers["x-access-token"];

  if (!token) {
    res.status(HttpStatusCode.FORBIDDEN)
      .json(SendErrorMessage(ErrorCode.FORBIDDEN, "A jwt token is required for authentication"));
    return;
  }

  try {
    const secretKey = process.env.SV_JWT_TOKEN_KEY;
    if (!secretKey) throw new Error("Missing SV_JWT_TOKEN_KEY in environment variables");

    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (!decoded.userId) {
      res.status(HttpStatusCode.UNAUTHORIZED)
        .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "Invalid JWT Token"));
      return;
    }

    req.user_jwt = decoded;

    const user = await User.findById(decoded.userId);
    if (user) {
      if (user.role?.toLowerCase() !== "admin") {
        res.status(HttpStatusCode.FORBIDDEN)
          .json(SendErrorMessage(ErrorCode.FORBIDDEN, "Admin only"));
        return;
      }
    } else {
      res.status(HttpStatusCode.UNAUTHORIZED)
        .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "User not found"));
      return;
    }
  } catch (err) {
    res.status(HttpStatusCode.UNAUTHORIZED)
      .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "Invalid JWT Token"));
    return;
  }

  return next();
};

export default adminAuth;
