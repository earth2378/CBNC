import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";

export type Db = NodePgDatabase<typeof schema>;

export async function findProfileByUserId(db: Db, userId: string) {
  const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function findProfileLocalizationsByUserId(db: Db, userId: string) {
  return db.select().from(schema.profileLocalizations).where(eq(schema.profileLocalizations.userId, userId));
}
