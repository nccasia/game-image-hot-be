import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user_jwt: JwtPayload;
      user_privy: string;
    }
  }
}

export {};