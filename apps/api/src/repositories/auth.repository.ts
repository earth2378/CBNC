import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";
import { AppError } from "../lib/errors.js";

export type Db = NodePgDatabase<typeof schema>;

export async function createRegisteredUser(db: Db, params: { email: string; passwordHash: string }) {
  try {
    return await db.transaction(async (tx) => {
      const insertedUsers = await tx
        .insert(schema.users)
        .values({
          email: params.email,
          passwordHash: params.passwordHash
        })
        .returning();
      const user = insertedUsers[0];
      if (!user) {
        throw new AppError(500, "INTERNAL_SERVER_ERROR", "failed to create user");
      }

      const insertedProfiles = await tx
        .insert(schema.profiles)
        .values({
          userId: user.id,
          emailPublic: params.email,
          phoneNumber: "-",
          prefEnableTh: true,
          prefEnableEn: true,
          prefEnableZh: true
        })
        .returning();
      const profile = insertedProfiles[0];
      if (!profile) {
        throw new AppError(500, "INTERNAL_SERVER_ERROR", "failed to create profile");
      }

      const localizations = await tx
        .insert(schema.profileLocalizations)
        .values([
          { userId: user.id, lang: "th", fullName: "-", position: "-", department: "-", botLocation: "-" },
          { userId: user.id, lang: "en", fullName: "-", position: "-", department: "-", botLocation: "-" },
          { userId: user.id, lang: "zh", fullName: "-", position: "-", department: "-", botLocation: "-" }
        ])
        .returning();

      const [settings] = await tx.select().from(schema.systemSettings).where(eq(schema.systemSettings.id, 1)).limit(1);

      return {
        user,
        profile,
        localizations,
        settings: settings ?? null
      };
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "23505") {
      throw new AppError(400, "VALIDATION_ERROR", "email already exists");
    }
    throw error;
  }
}
