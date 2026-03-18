import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function cleanCampaignName(name: string): string {
  if (!name) return "Unknown Campaign";
  // Removes CMB_ZA_ and replaces underscores with spaces
  return name.replace(/^CMB_ZA_/, '').replace(/_/g, ' ');
}
