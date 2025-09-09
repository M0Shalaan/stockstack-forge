import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthUser {
  id: string;
  role: 'admin' | 'manager' | 'staff';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = hdr.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function allowRoles(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.length || roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
