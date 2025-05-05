// src/routes/auth.routes.ts
import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';

const router = Router();

router.post('/', loginUser);

export { router as authRoutes };
