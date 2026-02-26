import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";

export type Db = NodePgDatabase<typeof schema>;

export async function findAllActiveLocations(db: Db) {
  return db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.isActive, true))
    .orderBy(schema.locations.sortOrder, schema.locations.code);
}

export async function findLocationById(db: Db, id: string) {
  const [row] = await db.select().from(schema.locations).where(eq(schema.locations.id, id)).limit(1);
  return row ?? null;
}
