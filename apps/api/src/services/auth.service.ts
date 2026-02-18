import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/auth/password.js";
import { AppError } from "../lib/errors.js";
import { createRegisteredUser } from "../repositories/auth.repository.js";
import { findProfileByUserId, findProfileLocalizationsByUserId } from "../repositories/profiles.repository.js";
import { findSystemSettings } from "../repositories/system-settings.repository.js";
import { findUserByEmail, updateUserLastLoginAt, updateUserPasswordHash } from "../repositories/users.repository.js";

type Db = NodePgDatabase<typeof schema>;

type Localization = {
  full_name: string;
  position: string;
  department: string;
  bot_location: string;
};

function getEnabledLangs(
  profile: { prefEnableTh: boolean; prefEnableEn: boolean; prefEnableZh: boolean },
  settings: { enableTh: boolean; enableEn: boolean; enableZh: boolean } | null
) {
  const globalSettings = settings ?? { enableTh: true, enableEn: true, enableZh: true };
  const enabled: Array<"th" | "en" | "zh"> = [];
  if (profile.prefEnableTh && globalSettings.enableTh) enabled.push("th");
  if (profile.prefEnableEn && globalSettings.enableEn) enabled.push("en");
  if (profile.prefEnableZh && globalSettings.enableZh) enabled.push("zh");
  return enabled;
}

function toLocalizationMap(rows: Array<typeof schema.profileLocalizations.$inferSelect>) {
  const defaultValue: Localization = {
    full_name: "-",
    position: "-",
    department: "-",
    bot_location: "-"
  };

  const mapped: Record<"th" | "en" | "zh", Localization> = {
    th: { ...defaultValue },
    en: { ...defaultValue },
    zh: { ...defaultValue }
  };

  for (const row of rows) {
    mapped[row.lang] = {
      full_name: row.fullName,
      position: row.position,
      department: row.department,
      bot_location: row.botLocation
    };
  }

  return mapped;
}

function toProfileResponse(
  user: typeof schema.users.$inferSelect,
  profile: typeof schema.profiles.$inferSelect,
  localizations: Array<typeof schema.profileLocalizations.$inferSelect>,
  settings: typeof schema.systemSettings.$inferSelect | null
) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.isActive
    },
    profile: {
      public_id: profile.publicId,
      photo_url: null,
      email_public: profile.emailPublic,
      phone_number: profile.phoneNumber,
      pref_enable_th: profile.prefEnableTh,
      pref_enable_en: profile.prefEnableEn,
      pref_enable_zh: profile.prefEnableZh
    },
    enabled_langs: getEnabledLangs(profile, settings),
    localizations: toLocalizationMap(localizations)
  };
}

export async function register(db: Db, input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = hashPassword(input.password);

  const result = await createRegisteredUser(db, { email, passwordHash });
  return toProfileResponse(result.user, result.profile, result.localizations, result.settings);
}

export async function login(db: Db, input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmail(db, email);

  if (!user || !verifyPassword(input.password, user.passwordHash) || !user.isActive) {
    throw new AppError(401, "UNAUTHORIZED", "invalid credentials or deactivated account");
  }

  await updateUserLastLoginAt(db, user.id);

  const profile = await findProfileByUserId(db, user.id);
  if (!profile) {
    throw new AppError(500, "INTERNAL_SERVER_ERROR", "profile not found for user");
  }

  const [localizations, settings] = await Promise.all([
    findProfileLocalizationsByUserId(db, user.id),
    findSystemSettings(db)
  ]);

  return {
    user,
    payload: toProfileResponse(user, profile, localizations, settings)
  };
}

export async function resetPassword(db: Db, input: { email: string; newPassword: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmail(db, email);

  if (user) {
    await updateUserPasswordHash(db, user.id, hashPassword(input.newPassword));
  }

  return { ok: true };
}
