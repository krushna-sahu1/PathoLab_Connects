import type { ZodError } from 'zod';

/** Zod 4 exposes issues on ZodError (there is no `.errors` property). */
export function firstZodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? 'Invalid input';
}
