import { Router } from 'express';
import { auth, allowRoles } from '../middleware/auth';
import Product from '../models/Product';
import { crudController } from '../controllers/crud';
import { validate, productSchemas } from '../middleware/validation';

const c = crudController(Product, { 
  populateFields: 'category',
  searchFields: ['name', 'sku', 'barcode']
});

const router = Router();

router.get('/', auth, c.list);
router.get('/:id', auth, c.get);
router.post('/', auth, allowRoles('admin', 'manager'), validate(productSchemas.create), c.create);
router.put('/:id', auth, allowRoles('admin', 'manager'), validate(productSchemas.update), c.update);
router.delete('/:id', auth, allowRoles('admin', 'manager'), c.remove);

export default router;
