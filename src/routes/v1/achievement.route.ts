import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { claimAchievement } from '../../controllers/achievement.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post("/achievement/claim", auth, asyncMiddleware(claimAchievement));

export default router;
