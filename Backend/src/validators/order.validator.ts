import { z } from 'zod';
import { PaymentMethod } from '../types';

export const createOrderSchema = z.object({
  body: z.object({
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
    items: z
      .array(
        z.object({
          productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
          quantity: z.number().int().positive('Quantity must be positive'),
        })
      )
      .min(1, 'Order must have at least one item'),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
});

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'CANCELED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

