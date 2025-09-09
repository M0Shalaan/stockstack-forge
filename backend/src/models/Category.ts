import mongoose, { Schema, Document } from 'mongoose';
export interface ICategory extends Document {
  name: string;
}
const schema = new Schema<ICategory>({ name: { type: String, required: true, unique: true } }, { timestamps: true });
export default mongoose.model<ICategory>('Category', schema);
