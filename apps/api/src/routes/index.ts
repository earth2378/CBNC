import type { FastifyPluginAsync } from "fastify";

import adminRoutes from "./admin.js";
import authRoutes from "./auth.js";
import exportRoutes from "./export.js";
import healthRoutes from "./health.js";
import meRoutes from "./me.js";
import publicRoutes from "./public.js";

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(meRoutes);
  await app.register(publicRoutes);
  await app.register(adminRoutes);
  await app.register(exportRoutes);
};

export default routes;
