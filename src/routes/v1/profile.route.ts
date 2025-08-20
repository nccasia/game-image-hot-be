import express, { Router } from 'express';

// Middleware
import auth from '../../middleware/auth';
import adminAuth from '../../middleware/adminAuth';
import privyAuth from '../../middleware/privyAuth';
import asyncMiddleware from '../../middleware/async_middleware';

// Controller
import { registerEmail, loginEmail, loginMezon, changePassword, getProfileData, AddCurrencyToAccount, getBalance,
  loginPrivy, linkWallet, changeUserName, getBotProfileData
 } from '../../controllers/profile.controller';

const router: Router = express.Router();

/**
 **********************************************************************
 * API Endpoints
 */

router.post('/users/register', asyncMiddleware(registerEmail));
router.post('/users/login', asyncMiddleware(loginEmail));
router.post('/users/login-mezon', asyncMiddleware(loginMezon));
router.post("/users/login-privy", privyAuth, asyncMiddleware(loginPrivy));

router.post('/users/change-password', auth, asyncMiddleware(changePassword));

router.get('/users/profile', auth, asyncMiddleware(getProfileData));
router.get('/users/balance', auth, asyncMiddleware(getBalance));
router.post("/users/link-wallet", auth, asyncMiddleware(linkWallet));
router.post("/users/change-username", auth, asyncMiddleware(changeUserName));

router.post('/users/add-currency', adminAuth, asyncMiddleware(AddCurrencyToAccount));
router.get('/users/bot-profile', asyncMiddleware(getBotProfileData));

export default router;
