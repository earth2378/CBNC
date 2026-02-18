import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, encodedHash: string): boolean {
  const parts = encodedHash.split("$");
  const [, rawSalt, rawHash] = parts;
  if (parts.length !== 3 || parts[0] !== "scrypt" || !rawSalt || !rawHash) {
    return false;
  }

  const salt = Buffer.from(rawSalt, "base64");
  const storedHash = Buffer.from(rawHash, "base64");
  const computedHash = scryptSync(password, salt, storedHash.length);
  return timingSafeEqual(storedHash, computedHash);
}
