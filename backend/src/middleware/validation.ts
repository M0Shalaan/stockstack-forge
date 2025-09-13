import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const authSchemas = {
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'manager', 'staff']).optional()
  }),
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
};

export const productSchemas = {
  create: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    minQuantity: z.number().min(0, 'Minimum quantity must be positive').optional(),
    expirationDate: z.string().datetime().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional()
  }),
  update: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    barcode: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    minQuantity: z.number().min(0).optional(),
    expirationDate: z.string().datetime().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional()
  })
};

export const transactionSchemas = {
  create: z.object({
    type: z.enum(['purchase', 'sale', 'transfer']),
    date: z.string().datetime().optional(),
    party: z.string().optional(),
    sourceWarehouse: z.string().optional(),
    targetWarehouse: z.string().optional(),
    items: z.array(z.object({
      product: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be positive')
    })).min(1, 'At least one item is required'),
    notes: z.string().optional()
  })
};

export const warehouseSchemas = {
  create: z.object({
    name: z.string().min(1, 'Warehouse name is required'),
    location: z.string().optional(),
    code: z.string().optional()
  })
};

export const categorySchemas = {
  create: z.object({
    name: z.string().min(1, 'Category name is required')
  })
};

export const partySchemas = {
  create: z.object({
    type: z.enum(['supplier', 'customer']),
    name: z.string().min(1, 'Party name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional()
  })
};