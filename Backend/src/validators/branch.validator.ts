import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Branch name must be at least 2 characters').max(200, 'Branch name cannot exceed 200 characters'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone format'),
    isActive: z.boolean().default(true),
    operatingHours: z
      .object({
        monday: z.object({ open: z.string(), close: z.string() }).optional(),
        tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
        wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
        thursday: z.object({ open: z.string(), close: z.string() }).optional(),
        friday: z.object({ open: z.string(), close: z.string() }).optional(),
        saturday: z.object({ open: z.string(), close: z.string() }).optional(),
        sunday: z.object({ open: z.string(), close: z.string() }).optional(),
      })
      .optional(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    address: z.string().min(10).optional(),
    phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
    isActive: z.boolean().optional(),
    operatingHours: z
      .object({
        monday: z.object({ open: z.string(), close: z.string() }).optional(),
        tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
        wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
        thursday: z.object({ open: z.string(), close: z.string() }).optional(),
        friday: z.object({ open: z.string(), close: z.string() }).optional(),
        saturday: z.object({ open: z.string(), close: z.string() }).optional(),
        sunday: z.object({ open: z.string(), close: z.string() }).optional(),
      })
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
  }),
});

export const getBranchSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
  }),
});

export const getBranchesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
    search: z.string().optional(),
    isActive: z.string().regex(/^(true|false)$/i).transform((val) => val.toLowerCase() === 'true').optional(),
  }),
});

export const nearbyBranchesSchema = z.object({
  query: z.object({
    lat: z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number).pipe(z.number().min(-90).max(90)),
    lng: z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number).pipe(z.number().min(-180).max(180)),
    radius: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).pipe(z.number().positive().max(50)).default('10'),
  }),
});

