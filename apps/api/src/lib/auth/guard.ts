import type { FastifyInstance, FastifyRequest } from "fastify";

import { AppError } from "../errors.js";
import { readSessionCookie } from "./session.js";

export function requireAdmin(app: FastifyInstance, request: FastifyRequest) {
  const session = readSessionCookie(app, request);
  if (!session || session.role !== "admin") {
    throw new AppError(403, "FORBIDDEN", "forbidden");
  }

  return session;
}
