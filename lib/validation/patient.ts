import { z } from 'zod';

export const createPatientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updatePatientSchema = createPatientSchema.partial();

export const createAddressSchema = z.object({
  label: z.enum(['home', 'office', 'other']),
  full_address: z.string().min(10, 'Please enter the full address'),
  area: z.string().optional().or(z.literal('')),
  sector: z.string().optional().or(z.literal('')),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  is_primary: z.coerce.boolean().default(false),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
