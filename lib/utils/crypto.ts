import { genSaltSync, hashSync } from "bcrypt-ts";

/**
 * Gera um hash bcrypt para uma senha
 * @param password - Senha em texto plano
 * @returns Hash bcrypt da senha (salt rounds: 10)
 */
export function generateHashedPassword(password: string): string {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);
  return hash;
}
