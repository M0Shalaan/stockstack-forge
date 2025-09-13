import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import { adjustStock, getStockLevel, validateStockAvailability } from '../utils/stock';
import { asyncHandler, createApiError } from '../middleware/errorHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const type = req.query.type as string;
  const skip = (page - 1) * limit;

  // Build filter
  let filter: any = {};
  if (type && ['purchase', 'sale', 'transfer'].includes(type)) {
    filter.type = type;
  }

  // Execute queries in parallel
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('party', 'name type')
      .populate('sourceWarehouse', 'name location')
      .populate('targetWarehouse', 'name location')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit
    }
  });
});

export const get = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('party', 'name type email phone')
    .populate('sourceWarehouse', 'name location code')
    .populate('targetWarehouse', 'name location code')
    .populate('items.product', 'name sku barcode category price')
    .lean();

  if (!transaction) {
    throw createApiError('Transaction not found', 404);
  }

  res.json({
    success: true,
    data: transaction
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { type, items, sourceWarehouse, targetWarehouse } = req.body;

  // Validate transaction type requirements
  if (type === 'purchase' && !targetWarehouse) {
    throw createApiError('Target warehouse is required for purchase transactions', 400);
  }
  if (type === 'sale' && !sourceWarehouse) {
    throw createApiError('Source warehouse is required for sale transactions', 400);
  }
  if (type === 'transfer' && (!sourceWarehouse || !targetWarehouse)) {
    throw createApiError('Both source and target warehouses are required for transfer transactions', 400);
  }
  if (type === 'transfer' && sourceWarehouse === targetWarehouse) {
    throw createApiError('Source and target warehouses cannot be the same', 400);
  }

  // For sales and transfers, validate stock availability
  if (type === 'sale' || type === 'transfer') {
    for (const item of items) {
      const available = await getStockLevel(sourceWarehouse, item.product);
      if (available < item.quantity) {
        throw createApiError(`Insufficient stock for product. Available: ${available}, Required: ${item.quantity}`, 400);
      }
    }
  }

  // Start database session for transaction
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create the transaction record
      const [transaction] = await Transaction.create([req.body], { session });

      // Process stock adjustments
      for (const item of transaction.items) {
        const quantity = Math.abs(item.quantity);
        
        switch (transaction.type) {
          case 'purchase':
            if (transaction.targetWarehouse) {
              await adjustStock(transaction.targetWarehouse, item.product, quantity, session);
            }
            break;
            
          case 'sale':
            if (transaction.sourceWarehouse) {
              await adjustStock(transaction.sourceWarehouse, item.product, -quantity, session);
            }
            break;
            
          case 'transfer':
            if (transaction.sourceWarehouse && transaction.targetWarehouse) {
              await adjustStock(transaction.sourceWarehouse, item.product, -quantity, session);
              await adjustStock(transaction.targetWarehouse, item.product, quantity, session);
            }
            break;
        }
      }

      // Populate the created transaction for response
      const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('party', 'name type')
        .populate('sourceWarehouse', 'name location')
        .populate('targetWarehouse', 'name location')
        .populate('items.product', 'name sku')
        .session(session);

      res.status(201).json({
        success: true,
        data: populatedTransaction
      });
    });
  } finally {
    await session.endSession();
  }
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw createApiError('Transaction not found', 404);
  }

  // Start database session for reversal
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Reverse stock adjustments
      for (const item of transaction.items) {
        const quantity = Math.abs(item.quantity);
        
        switch (transaction.type) {
          case 'purchase':
            if (transaction.targetWarehouse) {
              await adjustStock(transaction.targetWarehouse, item.product, -quantity, session);
            }
            break;
            
          case 'sale':
            if (transaction.sourceWarehouse) {
              await adjustStock(transaction.sourceWarehouse, item.product, quantity, session);
            }
            break;
            
          case 'transfer':
            if (transaction.sourceWarehouse && transaction.targetWarehouse) {
              await adjustStock(transaction.sourceWarehouse, item.product, quantity, session);
              await adjustStock(transaction.targetWarehouse, item.product, -quantity, session);
            }
            break;
        }
      }

      // Delete the transaction
      await Transaction.findByIdAndDelete(req.params.id).session(session);
    });

    res.json({
      success: true,
      message: 'Transaction deleted and stock adjustments reversed'
    });
  } finally {
    await session.endSession();
  }
});
