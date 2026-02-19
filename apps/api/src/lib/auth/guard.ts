import type { FastifyInstance, FastifyRequest } from "fastify";

import { AppError } from "../errors.js";
import { readSessionCookie } from "./session.js";

export function requireAuth(app: FastifyInstance, request: FastifyRequest) {
  const session = readSessionCookie(app, request);
  if (!session) {
    throw new AppError(401, "UNAUTHORIZED", "not authenticated");
  }

  return session;
}

export function requireAdmin(app: FastifyInstance, request: FastifyRequest) {
  const session = requireAuth(app, request);
  if (session.role !== "admin") {
    throw new AppError(403, "FORBIDDEN", "forbidden");
  }

  return session;
}
