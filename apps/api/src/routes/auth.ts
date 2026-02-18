import type { FastifyPluginAsync } from "fastify";

import { notImplemented } from "../lib/http.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (_request, reply) => {
    return notImplemented(reply, "POST /auth/register");
  });

  app.post("/auth/login", async (_request, reply) => {
    return notImplemented(reply, "POST /auth/login");
  });

  app.post("/auth/logout", async (_request, reply) => {
    return notImplemented(reply, "POST /auth/logout");
  });

  app.post("/auth/reset-password", async (_request, reply) => {
    return notImplemented(reply, "POST /auth/reset-password");
  });
};

export default authRoutes;
