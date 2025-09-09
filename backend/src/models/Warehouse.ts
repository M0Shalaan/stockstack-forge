import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  location?: string;
  code?: string;
}
const schema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    location: String,
    code: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWarehouse>('Warehouse', schema);
