import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";

export type Db = NodePgDatabase<typeof schema>;

export async function findSystemSettings(db: Db) {
  const [settings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.id, 1)).limit(1);
  return settings ?? null;
}
