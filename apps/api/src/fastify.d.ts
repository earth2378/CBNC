import "fastify";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "./db/schema.js";
import type { StorageProvider } from "./lib/storage/provider.js";
import type { AppEnv } from "./types/env.js";

declare module "fastify" {
  interface FastifyInstance {
    db: NodePgDatabase<typeof schema>;
    env: AppEnv;
    storage: StorageProvider;
  }
}
