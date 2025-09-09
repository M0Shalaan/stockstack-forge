import { Router } from 'express';
import { auth, allowRoles } from '../middleware/auth';
import { list, get, create, remove } from '../controllers/transactionController';
const router = Router();
router.get('/', auth, list);
router.get('/:id', auth, get);
router.post('/', auth, allowRoles('admin', 'manager'), create);
router.delete('/:id', auth, allowRoles('admin', 'manager'), remove);
export default router;
