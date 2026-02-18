import type { FastifyPluginAsync } from "fastify";

import { notImplemented } from "../lib/http.js";

const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me/profile", async (_request, reply) => {
    return notImplemented(reply, "GET /me/profile");
  });

  app.put("/me/profile", async (_request, reply) => {
    return notImplemented(reply, "PUT /me/profile");
  });

  app.post("/me/photo", async (_request, reply) => {
    return notImplemented(reply, "POST /me/photo");
  });
};

export default meRoutes;
