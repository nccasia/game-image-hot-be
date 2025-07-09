import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { GenerateCoupon, CouponInfo, UseCoupon } from '../../controllers/coupon.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post("/coupon/generate", adminAuth, asyncMiddleware(GenerateCoupon));
router.get("/coupon/info", auth, asyncMiddleware(CouponInfo));
router.post("/coupon/use", auth, asyncMiddleware(UseCoupon));

export default router;
