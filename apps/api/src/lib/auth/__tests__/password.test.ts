import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password.js";

describe("hashPassword", () => {
  it("returns a scrypt-prefixed string", () => {
    const hash = hashPassword("mypassword");
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("produces a different hash each call (random salt)", () => {
    const h1 = hashPassword("same");
    const h2 = hashPassword("same");
    expect(h1).not.toBe(h2);
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", () => {
    const hash = hashPassword("correct-horse");
    expect(verifyPassword("correct-horse", hash)).toBe(true);
  });

  it("returns false for wrong password", () => {
    const hash = hashPassword("correct-horse");
    expect(verifyPassword("wrong-horse", hash)).toBe(false);
  });

  it("returns false for malformed hash", () => {
    expect(verifyPassword("anything", "notahash")).toBe(false);
    expect(verifyPassword("anything", "scrypt$onlytwoparts")).toBe(false);
  });
});
