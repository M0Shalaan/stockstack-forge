import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { adjustStock } from '../utils/stock';

export async function list(req: Request, res: Response) {
  const items = await Transaction.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json(items);
}

export async function get(req: Request, res: Response) {
  const item = await Transaction.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}

export async function create(req: Request, res: Response) {
  const tx = await Transaction.create(req.body);
  for (const it of tx.items) {
    if (tx.type === 'purchase') {
      if (!tx.targetWarehouse) continue;
      await adjustStock(tx.targetWarehouse as any, it.product as any, Math.abs(it.quantity));
    } else if (tx.type === 'sale') {
      if (!tx.sourceWarehouse) continue;
      await adjustStock(tx.sourceWarehouse as any, it.product as any, -Math.abs(it.quantity));
    } else if (tx.type === 'transfer') {
      if (!tx.sourceWarehouse || !tx.targetWarehouse) continue;
      await adjustStock(tx.sourceWarehouse as any, it.product as any, -Math.abs(it.quantity));
      await adjustStock(tx.targetWarehouse as any, it.product as any, Math.abs(it.quantity));
    }
  }
  res.status(201).json(tx);
}

export async function remove(req: Request, res: Response) {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}
