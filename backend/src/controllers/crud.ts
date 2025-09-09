import { Request, Response } from 'express';
import { Model } from 'mongoose';

export const crudController = <T>(ModelCtor: Model<T>) => ({
  list: async (req: Request, res: Response) => {
    const q = (req.query.q as string | undefined) || '';
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const items = await (ModelCtor as any).find(filter).limit(200).lean();
    res.json(items);
  },
  get: async (req: Request, res: Response) => {
    const item = await (ModelCtor as any).findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  },
  create: async (req: Request, res: Response) => {
    const created = await (ModelCtor as any).create(req.body);
    res.status(201).json(created);
  },
  update: async (req: Request, res: Response) => {
    const updated = await (ModelCtor as any).findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  },
  remove: async (req: Request, res: Response) => {
    const removed = await (ModelCtor as any).findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  },
});
