import mongoose, { Schema, Document, Types } from 'mongoose';
export type TxType = 'purchase' | 'sale' | 'transfer';
export interface ITransactionItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}
export interface ITransaction extends Document {
  type: TxType;
  date: Date;
  party?: Types.ObjectId; // supplier or customer
  sourceWarehouse?: Types.ObjectId;
  targetWarehouse?: Types.ObjectId;
  items: ITransactionItem[];
  notes?: string;
}
const ItemSchema = new Schema<ITransactionItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const schema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ['purchase', 'sale', 'transfer'], required: true },
    date: { type: Date, default: () => new Date() },
    party: { type: Schema.Types.ObjectId, ref: 'Party' },
    sourceWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    targetWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    items: { type: [ItemSchema], required: true },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', schema);
