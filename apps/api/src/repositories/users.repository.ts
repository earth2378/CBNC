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

export async function listUserSummaries(db: Db) {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt
    })
    .from(schema.users);
}

export async function setUserActiveStatus(db: Db, userId: string, isActive: boolean) {
  const updated = await db
    .update(schema.users)
    .set({ isActive })
    .where(eq(schema.users.id, userId))
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt
    });

  return updated[0] ?? null;
}
