import express, { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../../config/http_status_code';
import { ErrorCode } from '../../config/error_code';

const router = express.Router();

// PING
router.get('/ping', (req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatusCode.OK).json({
    error_code: ErrorCode.NONE,
    data: {
      message: 'pong',
    },
  });
});

export default router;
