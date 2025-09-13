import { Router } from 'express';
import { auth, allowRoles } from '../middleware/auth';
import Category from '../models/Category';
import { crudController } from '../controllers/crud';
import { validate, categorySchemas } from '../middleware/validation';

const c = crudController(Category);

const router = Router();

router.get('/', auth, c.list);
router.get('/:id', auth, c.get);
router.post('/', auth, allowRoles('admin', 'manager'), validate(categorySchemas.create), c.create);
router.put('/:id', auth, allowRoles('admin', 'manager'), validate(categorySchemas.create), c.update);
router.delete('/:id', auth, allowRoles('admin', 'manager'), c.remove);

export default router;
