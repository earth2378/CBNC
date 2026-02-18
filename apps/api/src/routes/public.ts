import type { FastifyPluginAsync } from "fastify";

import { notImplemented } from "../lib/http.js";

const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/public/profiles/:public_id", async (_request, reply) => {
    return notImplemented(reply, "GET /public/profiles/{public_id}");
  });

  app.get("/public/profiles/:public_id/card.pdf", async (_request, reply) => {
    return notImplemented(reply, "GET /public/profiles/{public_id}/card.pdf");
  });

  app.get("/public/profiles/:public_id/card.jpg", async (_request, reply) => {
    return notImplemented(reply, "GET /public/profiles/{public_id}/card.jpg");
  });
};

export default publicRoutes;
