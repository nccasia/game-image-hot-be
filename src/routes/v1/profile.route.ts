import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { registerEmail, loginEmail, loginMezon, changePassword, getProfileData, AddCurrencyToAccount, getBalance } from '../../controllers/profile.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post('/users/register', asyncMiddleware(registerEmail));
router.post('/users/login', asyncMiddleware(loginEmail));
router.post('/users/login-mezon', asyncMiddleware(loginMezon));

router.post('/users/change-password', auth, asyncMiddleware(changePassword));

router.get('/users/profile', auth, asyncMiddleware(getProfileData));
router.get('/users/balance', auth, asyncMiddleware(getBalance));

router.post('/users/add-currency', adminAuth, asyncMiddleware(AddCurrencyToAccount));

export default router;
