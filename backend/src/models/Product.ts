import mongoose, { Schema, Document, Types } from "mongoose";
export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode?: string;
  category?: Types.ObjectId;
  price: number;
  minQuantity?: number;
  expirationDate?: Date;
  description?: string;
  imageUrl?: string;
  warehouse?: Types.ObjectId;
}
const schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    barcode: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true, min: 0 },
    minQuantity: { type: Number, default: 0 },
    expirationDate: Date,
    description: String,
    imageUrl: String,
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", schema);
