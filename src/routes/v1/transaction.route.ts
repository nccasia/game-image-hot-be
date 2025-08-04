import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { GetPastEventFromBlock } from '../../controllers/transaction.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */
router.post("/transaction/get-past-events", adminAuth, asyncMiddleware(GetPastEventFromBlock));

export default router;
