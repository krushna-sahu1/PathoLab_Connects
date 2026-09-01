import { z } from 'zod';

export const createPatientSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const createAddressSchema = z.object({
  label: z.enum(['home', 'office', 'other']),
  full_address: z.string().min(10),
  area: z.string().optional(),
  sector: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_primary: z.boolean().default(false),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
