import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { GameConfig, GameDataConfig, GetBundleDataConfig, SetupGameConfig, ExportData } from '../../controllers/config.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.get("/config/game-config", GameConfig);
router.get("/config/game-data-config", GameDataConfig);
router.get("/config/bundle-data-config", GetBundleDataConfig);

router.post("/config/setup-game-config", adminAuth, asyncMiddleware(SetupGameConfig));
router.post("/config/export-data", adminAuth, asyncMiddleware(ExportData));

export default router;
