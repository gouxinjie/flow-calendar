/**
 * @description 密码哈希与校验工具
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * @description 生成密码哈希
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

/**
 * @description 判断是否为新格式密码哈希
 */
export function isHashedPassword(value: string): boolean {
  return value.startsWith(`${HASH_PREFIX}$`);
}

/**
 * @description 校验密码
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [, salt, hash] = storedHash.split("$");
  if (!salt || !hash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(hash, "hex");

  if (expectedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedBuffer);
}
