import { Logger } from '../logger/winston-logger.config';
import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../config/http_status_code';
import { ErrorCode } from '../config/error_code';
import { ErrorMessage } from '../config/error_message';
import { SendErrorMessage } from '../utils/helper';
import { privy, getPrivyUserInfoById } from './privyClient';

import * as dotenv from 'dotenv';
dotenv.config();

const privyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const privyToken = req.body?.token || req.query?.token || req.headers["x-access-token"];

  if (!privyToken) {
    res.status(HttpStatusCode.FORBIDDEN)
      .json(SendErrorMessage(ErrorCode.FORBIDDEN, "A jwt token is required for authentication"));
    return;
  }

  try {
    const privyClaims = await privy.verifyAuthToken(privyToken);
    if (!privyClaims) {
      res.status(HttpStatusCode.UNAUTHORIZED)
        .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "Invalid privy Token"));
      return;
    }
    const privyUser = await getPrivyUserInfoById(privyClaims.userId);
    if(!privyUser) {
      res.status(HttpStatusCode.UNAUTHORIZED)
        .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "Invalid privy user"));
      return;
    }
    req.user_privy = privyUser.id;
  } catch (err) {
    res.status(HttpStatusCode.UNAUTHORIZED)
      .json(SendErrorMessage(ErrorCode.UNAUTHORIZED, "Invalid privy Token"));
  }
  return next();
};

export default privyAuth;
