import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { adminQueryValidator, adminUserUpdateValidator } from '../validators/adminValidator';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth + requireAdmin to all admin endpoints
router.use(authenticate, requireAdmin);

router.get('/users', adminQueryValidator, adminController.getUsers);
router.put('/users/:id', adminUserUpdateValidator, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/notes', adminQueryValidator, adminController.getNotes);
router.delete('/notes/:id', adminController.deleteNote);

export default router;
