import Fastify from "fastify";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

import routes from "./routes/index.js";
import { createDb } from "./lib/db.js";
import { createStorageProvider, getLocalUploadDir, resolveLocalObjectPath } from "./lib/storage/provider.js";
import { loadEnv } from "./plugins/env.js";

export function buildApp() {
  const env = loadEnv();
  const app = Fastify({ logger: true });
  const db = createDb(env.DATABASE_URL);
  const storage = createStorageProvider(env);

  app.decorate("env", env);
  app.decorate("db", db);
  app.decorate("storage", storage);

  void app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: "onRequest"
  });

  void app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });

  app.get("/uploads/*", async (request, reply) => {
    if (env.STORAGE_PROVIDER !== "local") {
      return reply.code(404).send({
        error: {
          code: "NOT_FOUND",
          message: "file not found"
        }
      });
    }

    try {
      const params = request.params as { "*": string };
      const objectKey = params["*"];
      if (!objectKey || objectKey.includes("..") || path.isAbsolute(objectKey)) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "invalid file path"
          }
        });
      }

      const filePath = resolveLocalObjectPath(env, objectKey);
      const localRoot = getLocalUploadDir(env);
      if (!filePath.startsWith(localRoot)) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "invalid file path"
          }
        });
      }

      await stat(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "application/octet-stream";

      reply.header("Content-Type", contentType);
      return reply.send(createReadStream(filePath));
    } catch {
      return reply.code(404).send({
        error: {
          code: "NOT_FOUND",
          message: "file not found"
        }
      });
    }
  });

  void app.register(routes);

  return app;
}
