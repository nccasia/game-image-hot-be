import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { GetLeaderboardByName } from '../../controllers/leaderboard.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.get("/leaderboard/:name", auth, asyncMiddleware(GetLeaderboardByName));

export default router;
