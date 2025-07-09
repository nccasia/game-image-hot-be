import express, { Router } from 'express';

import testRoutes from './test';
import configRoutes from './config.route';
import userRoutes from './profile.route';
import friendRoutes from './friend.route';
import tutorialRoutes from './tutorial.route';
import achievementRoutes from './achievement.route';
import questRoutes from './quest.route';
import leaderboardRoutes from './leaderboard.route';
import couponRoutes from './coupon.route';
import photosRoutes from './photos.route'

const router: Router = express.Router();

router.use('/test', testRoutes);
router.use('/', configRoutes);
router.use('/', userRoutes);
router.use('/', friendRoutes);
router.use('/', tutorialRoutes);
router.use('/', achievementRoutes);
router.use('/', questRoutes);
router.use('/', leaderboardRoutes);
router.use('/', couponRoutes);
router.use('/', photosRoutes);

export default router;
