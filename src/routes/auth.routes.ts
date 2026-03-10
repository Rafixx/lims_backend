// src/routes/auth.routes.ts
import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/', loginRateLimiter, loginUser);

export { router as authRoutes };
