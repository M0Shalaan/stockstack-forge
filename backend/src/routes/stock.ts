import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getAllStockLevels } from '../utils/stock';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get all stock levels across warehouses
router.get('/', auth, asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouse as string;
  const stocks = await getAllStockLevels(warehouseId);
  
  res.json({
    success: true,
    data: stocks
  });
}));

// Get low stock alerts
router.get('/alerts', auth, asyncHandler(async (req, res) => {
  const stocks = await getAllStockLevels();
  const lowStockItems = stocks.filter(stock => stock.isLowStock);
  
  res.json({
    success: true,
    data: lowStockItems,
    count: lowStockItems.length
  });
}));

export default router;