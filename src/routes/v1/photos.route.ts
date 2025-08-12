import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { getRandomQuestion, finishQuestion, endGame, betGame } from '../../controllers/photos.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.get("/photo/get-question", adminAuth, asyncMiddleware(getRandomQuestion));
router.post("/photo/finish-question", adminAuth, asyncMiddleware(finishQuestion));
router.post("/photo/bet-game", adminAuth, asyncMiddleware(betGame));
router.post("/photo/end-game", adminAuth, asyncMiddleware(endGame));

export default router;
