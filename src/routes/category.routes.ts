import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, categoryController.getAll);
router.post('/', authenticate, authorizeAdmin, categoryController.create);
router.put('/:id', authenticate, authorizeAdmin, categoryController.update);
router.delete('/:id', authenticate, authorizeAdmin, categoryController.remove);

export default router;
