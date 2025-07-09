import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { getAllFriendInfo } from '../../controllers/friend.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.get("/friends/all", auth, asyncMiddleware(getAllFriendInfo));

export default router;
