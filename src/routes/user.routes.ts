import { Router } from 'express';
import { updatePreferences } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.put('/preferences', authenticate, updatePreferences);

export default router;
