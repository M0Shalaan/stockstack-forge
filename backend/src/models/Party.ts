import mongoose, { Schema, Document } from 'mongoose';
export type PartyType = 'supplier' | 'customer';
export interface IParty extends Document {
  type: PartyType;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
const schema = new Schema<IParty>(
  {
    type: { type: String, enum: ['supplier', 'customer'], required: true, index: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
  },
  { timestamps: true }
);

export default mongoose.model<IParty>('Party', schema);
