// src/routes/auth.routes.ts
import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.post('/login', loginUser);

export default authRoutes;
