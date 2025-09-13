import { Router } from 'express';
import { auth, allowRoles } from '../middleware/auth';
import Party from '../models/Party';
import { crudController } from '../controllers/crud';
import { validate, partySchemas } from '../middleware/validation';

const c = crudController(Party, {
  searchFields: ['name', 'email', 'phone']
});

const router = Router();

router.get('/', auth, c.list);
router.get('/:id', auth, c.get);
router.post('/', auth, allowRoles('admin', 'manager'), validate(partySchemas.create), c.create);
router.put('/:id', auth, allowRoles('admin', 'manager'), validate(partySchemas.create), c.update);
router.delete('/:id', auth, allowRoles('admin', 'manager'), c.remove);

export default router;
