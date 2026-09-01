import { type ClassValue, clsx } from 'clsx';
// import { twMerge } from 'tailwind-merge'; // TODO: install tailwind-merge if needed

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN');
}

export function formatPhone(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}
