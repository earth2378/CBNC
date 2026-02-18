import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";

export type Db = NodePgDatabase<typeof schema>;

export async function findUserByEmail(db: Db, email: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return user ?? null;
}

export async function updateUserLastLoginAt(db: Db, userId: string) {
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, userId));
}

export async function updateUserPasswordHash(db: Db, userId: string, passwordHash: string) {
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, userId));
}
