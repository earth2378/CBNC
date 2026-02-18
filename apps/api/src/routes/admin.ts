import type { FastifyPluginAsync } from "fastify";

import { notImplemented } from "../lib/http.js";

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/users", async (_request, reply) => {
    return notImplemented(reply, "GET /admin/users");
  });

  app.patch("/admin/users/:user_id", async (_request, reply) => {
    return notImplemented(reply, "PATCH /admin/users/{user_id}");
  });
};

export default adminRoutes;
