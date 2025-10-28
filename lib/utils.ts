import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { nanoid } from "nanoid";

/**
 * Retorna as iniciais de um nome (primeiras letras de cada palavra)
 * @param name - Nome completo
 * @returns String com até 2 iniciais em maiúsculas
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
