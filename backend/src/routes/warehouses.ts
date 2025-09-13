import { Router } from 'express';
import { auth, allowRoles } from '../middleware/auth';
import Warehouse from '../models/Warehouse';
import { crudController } from '../controllers/crud';
import { validate, warehouseSchemas } from '../middleware/validation';

const c = crudController(Warehouse, {
  searchFields: ['name', 'location', 'code']
});

const router = Router();

router.get('/', auth, c.list);
router.get('/:id', auth, c.get);
router.post('/', auth, allowRoles('admin', 'manager'), validate(warehouseSchemas.create), c.create);
router.put('/:id', auth, allowRoles('admin', 'manager'), validate(warehouseSchemas.create), c.update);
router.delete('/:id', auth, allowRoles('admin', 'manager'), c.remove);

export default router;
