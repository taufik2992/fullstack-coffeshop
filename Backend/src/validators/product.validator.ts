import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(200, 'Product name cannot exceed 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
    price: z.number().positive('Price must be positive'),
    category: z.enum(['Coffee', 'Non-Coffee', 'Food', 'Snack', 'Merchandise', 'Other']),
    stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
    isAvailable: z.boolean().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).max(1000).optional(),
    price: z.number().positive().optional(),
    category: z.enum(['Coffee', 'Non-Coffee', 'Food', 'Snack', 'Merchandise', 'Other']).optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
    search: z.string().optional(),
    category: z.string().optional(),
    isAvailable: z.string().regex(/^(true|false)$/i).transform((val: string) => val.toLowerCase() === 'true').optional(),
    sort: z.string().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

