// src/routes/user.ts
import { Router } from 'express';

const router = Router();

// Datos simulados para el usuario
const user = { id: 1, name: 'John Doe' };

router.get('/', (req, res) => {
  res.json(user);
});

export default router;
