import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { asyncHandler, createApiError } from '../middleware/errorHandler';

interface CrudOptions {
  populateFields?: string | string[];
  searchFields?: string[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export const crudController = <T extends Document>(ModelCtor: Model<T>, options: CrudOptions = {}) => {
  const {
    populateFields = '',
    searchFields = ['name'],
    sortField = 'createdAt',
    sortOrder = 'desc'
  } = options;

  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = (req.query.q as string) || '';
      const skip = (page - 1) * limit;

      // Build search filter
      let filter: any = {};
      if (search) {
        const searchConditions = searchFields.map(field => ({
          [field]: { $regex: search, $options: 'i' }
        }));
        filter = { $or: searchConditions };
      }

      // Execute queries in parallel
      const [items, total] = await Promise.all([
        ModelCtor.find(filter)
          .populate(populateFields)
          .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ModelCtor.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: items,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
      const item = await ModelCtor.findById(req.params.id).populate(populateFields).lean();
      if (!item) {
        throw createApiError('Resource not found', 404);
      }

      res.json({
        success: true,
        data: item
      });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const created = await ModelCtor.create(req.body);
      const populated = await ModelCtor.findById(created._id).populate(populateFields).lean();

      res.status(201).json({
        success: true,
        data: populated
      });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const updated = await ModelCtor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate(populateFields);

      if (!updated) {
        throw createApiError('Resource not found', 404);
      }

      res.json({
        success: true,
        data: updated
      });
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const removed = await ModelCtor.findByIdAndDelete(req.params.id);
      if (!removed) {
        throw createApiError('Resource not found', 404);
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    })
  };
};
