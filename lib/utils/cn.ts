import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * Útil para mesclar classes condicionais do Tailwind sem conflitos
 * @param inputs - Classes CSS para combinar
 * @returns String com classes mescladas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
