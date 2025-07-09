import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { updateTutorial } from '../../controllers/tutorial.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post("/tutorial/update", auth, asyncMiddleware(updateTutorial));

export default router;
