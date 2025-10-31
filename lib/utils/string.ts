/**
 * Retorna as iniciais de um nome (primeiras letras de cada palavra)
 * @param name - Nome completo
 * @returns String com até 2 iniciais em maiúsculas
 * @example
 * getInitials("João Silva") // "JS"
 * getInitials("Ana") // "A"
 * getInitials("Pedro Paulo Santos") // "PP"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
