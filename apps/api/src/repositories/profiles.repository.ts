import { and, eq } from "drizzle-orm";
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

export async function findProfileByPublicId(db: Db, publicId: string) {
  const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.publicId, publicId)).limit(1);
  return profile ?? null;
}

export async function findProfileLocalizationByUserIdAndLang(db: Db, userId: string, lang: "th" | "en" | "zh") {
  const [row] = await db
    .select()
    .from(schema.profileLocalizations)
    .where(and(eq(schema.profileLocalizations.userId, userId), eq(schema.profileLocalizations.lang, lang)))
    .limit(1);
  return row ?? null;
}

export async function updateProfileNonLocalized(
  db: Db,
  input: {
    userId: string;
    emailPublic: string;
    phoneNumber: string;
    prefEnableTh: boolean;
    prefEnableEn: boolean;
    prefEnableZh: boolean;
    locationId: string | null;
  }
) {
  const updated = await db
    .update(schema.profiles)
    .set({
      emailPublic: input.emailPublic,
      phoneNumber: input.phoneNumber,
      prefEnableTh: input.prefEnableTh,
      prefEnableEn: input.prefEnableEn,
      prefEnableZh: input.prefEnableZh,
      locationId: input.locationId
    })
    .where(eq(schema.profiles.userId, input.userId))
    .returning();

  return updated[0] ?? null;
}

export async function updateProfilePhotoObjectKey(db: Db, input: { userId: string; photoObjectKey: string | null }) {
  const updated = await db
    .update(schema.profiles)
    .set({
      photoObjectKey: input.photoObjectKey
    })
    .where(eq(schema.profiles.userId, input.userId))
    .returning();

  return updated[0] ?? null;
}

export async function upsertProfileLocalization(
  db: Db,
  input: {
    userId: string;
    lang: "th" | "en" | "zh";
    fullName: string;
    position: string;
    department: string;
  }
) {
  const updated = await db
    .insert(schema.profileLocalizations)
    .values({
      userId: input.userId,
      lang: input.lang,
      fullName: input.fullName,
      position: input.position,
      department: input.department
    })
    .onConflictDoUpdate({
      target: [schema.profileLocalizations.userId, schema.profileLocalizations.lang],
      set: {
        fullName: input.fullName,
        position: input.position,
        department: input.department
      }
    })
    .returning();

  return updated[0] ?? null;
}
