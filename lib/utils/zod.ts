import type { ZodError } from 'zod';

export function firstZodMessage(error: ZodError): string {
  const issue = error.issues?.[0];
  if (issue?.message) return issue.message;
  const legacy = (error as unknown as { errors?: { message?: string }[] }).errors?.[0];
  return legacy?.message ?? 'Invalid input';
}
