import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config';

const sign = (user: any) => jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already in use' });
  const user = await User.create({ name, email, password, role: role ?? 'manager' });
  const token = sign(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await (user as any).comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
