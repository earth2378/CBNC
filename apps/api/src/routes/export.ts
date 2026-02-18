import type { FastifyPluginAsync } from "fastify";

import { notImplemented } from "../lib/http.js";

const exportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me/qr.png", async (_request, reply) => {
    return notImplemented(reply, "GET /me/qr.png");
  });

  app.get("/me/card.pdf", async (_request, reply) => {
    return notImplemented(reply, "GET /me/card.pdf");
  });

  app.get("/me/card.jpg", async (_request, reply) => {
    return notImplemented(reply, "GET /me/card.jpg");
  });
};

export default exportRoutes;
