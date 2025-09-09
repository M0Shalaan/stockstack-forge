import Stock from '../models/Stock';
import { Types } from 'mongoose';

export async function adjustStock(
  warehouseId: string | Types.ObjectId,
  productId: string | Types.ObjectId,
  delta: number
) {
  const doc = await Stock.findOneAndUpdate(
    { warehouse: warehouseId, product: productId },
    { $inc: { quantity: delta } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc;
}
