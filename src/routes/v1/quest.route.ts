import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { claimDailyQuest, claimBasicQuest } from '../../controllers/quest.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post("/quest/claim-daily", auth, asyncMiddleware(claimDailyQuest));
router.post("/quest/claim-basic", auth, asyncMiddleware(claimBasicQuest));

export default router;
