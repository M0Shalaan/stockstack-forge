import Stock from '../models/Stock';
import { Types, ClientSession } from 'mongoose';

export async function adjustStock(
  warehouseId: string | Types.ObjectId,
  productId: string | Types.ObjectId,
  delta: number,
  session?: ClientSession
) {
  const options: any = { 
    upsert: true, 
    new: true, 
    setDefaultsOnInsert: true 
  };
  
  if (session) {
    options.session = session;
  }

  const doc = await Stock.findOneAndUpdate(
    { warehouse: warehouseId, product: productId },
    { $inc: { quantity: delta } },
    options
  );

  // Ensure quantity doesn't go negative
  if (doc && doc.quantity < 0) {
    throw new Error(`Insufficient stock. Available: ${doc.quantity - delta}, Required: ${Math.abs(delta)}`);
  }

  return doc;
}

export async function getStockLevel(
  warehouseId: string | Types.ObjectId,
  productId: string | Types.ObjectId
): Promise<number> {
  const stock = await Stock.findOne({
    warehouse: warehouseId,
    product: productId
  }).lean();

  return stock?.quantity || 0;
}

export async function getStockLevels(
  warehouseId: string | Types.ObjectId,
  productIds: (string | Types.ObjectId)[]
): Promise<{ [productId: string]: number }> {
  const stocks = await Stock.find({
    warehouse: warehouseId,
    product: { $in: productIds }
  }).lean();

  const levels: { [productId: string]: number } = {};
  
  for (const productId of productIds) {
    const stock = stocks.find(s => s.product.toString() === productId.toString());
    levels[productId.toString()] = stock?.quantity || 0;
  }

  return levels;
}

export async function validateStockAvailability(
  warehouseId: string | Types.ObjectId,
  items: { product: string | Types.ObjectId; quantity: number }[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  for (const item of items) {
    const available = await getStockLevel(warehouseId, item.product);
    if (available < item.quantity) {
      errors.push(`Product ${item.product}: Available ${available}, Required ${item.quantity}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function getAllStockLevels(warehouseId?: string | Types.ObjectId) {
  const filter = warehouseId ? { warehouse: warehouseId } : {};
  
  const stocks = await Stock.find(filter)
    .populate('product', 'name sku minQuantity')
    .populate('warehouse', 'name location')
    .lean();

  return stocks.map(stock => ({
    id: stock._id,
    product: stock.product,
    warehouse: stock.warehouse,
    quantity: stock.quantity,
    isLowStock: stock.quantity <= (stock.product as any).minQuantity || 0
  }));
}
