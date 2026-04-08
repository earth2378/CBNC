import { describe, it, expect } from "vitest";
import { AppError, isAppError } from "../errors.js";

describe("AppError", () => {
  it("stores statusCode, code, and message", () => {
    const err = new AppError(404, "NOT_FOUND", "resource not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("resource not found");
    expect(err.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    const err = new AppError(500, "INTERNAL_SERVER_ERROR", "oops");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new AppError(400, "BAD_REQUEST", "bad"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(42)).toBe(false);
  });
});
