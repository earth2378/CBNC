import { describe, it, expect } from "vitest";
import { ApiError } from "../api";

describe("ApiError", () => {
  it("stores status and message", () => {
    const err = new ApiError(401, "Unauthorized");
    expect(err.status).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("is an instance of Error", () => {
    expect(new ApiError(500, "Server error")).toBeInstanceOf(Error);
  });
});
