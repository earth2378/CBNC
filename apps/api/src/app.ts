import Fastify from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";

import routes from "./routes/index.js";
import { createDb } from "./lib/db.js";
import { loadEnv } from "./plugins/env.js";

export function buildApp() {
  const env = loadEnv();
  const app = Fastify({ logger: true });
  const db = createDb(env.DATABASE_URL);

  app.decorate("env", env);
  app.decorate("db", db);

  void app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: "onRequest"
  });

  void app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });

  void app.register(routes);

  return app;
}
