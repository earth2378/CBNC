import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../db/schema.js";

const globalKey = "__cbnc_pg_pool__";
const drizzleGlobalKey = "__cbnc_drizzle_db__";

type GlobalWithPool = typeof globalThis & {
  [globalKey]?: Pool;
  [drizzleGlobalKey]?: NodePgDatabase<typeof schema>;
};

export function createDbPool(connectionString: string): Pool {
  const g = globalThis as GlobalWithPool;
  if (!g[globalKey]) {
    g[globalKey] = new Pool({ connectionString });
  }
  return g[globalKey];
}

export function createDb(connectionString: string) {
  const g = globalThis as GlobalWithPool;
  if (!g[drizzleGlobalKey]) {
    const pool = createDbPool(connectionString);
    g[drizzleGlobalKey] = drizzle(pool, { schema });
  }
  return g[drizzleGlobalKey];
}
