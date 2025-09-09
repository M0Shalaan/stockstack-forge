import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IStock extends Document {
  product: Types.ObjectId;
  warehouse: Types.ObjectId;
  quantity: number;
}
const schema = new Schema<IStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);
schema.index({ product: 1, warehouse: 1 }, { unique: true });
export default mongoose.model<IStock>('Stock', schema);
