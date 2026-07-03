import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { createNoteValidator, updateNoteValidator } from '../validators/noteValidator';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth to all note routes
router.use(authenticate);

router.get('/', noteController.getNotes);
router.post('/', createNoteValidator, noteController.createNote);
router.put('/:id', updateNoteValidator, noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;
