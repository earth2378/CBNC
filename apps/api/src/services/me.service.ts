import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";
import { AppError } from "../lib/errors.js";
import {
  findProfileByUserId,
  findProfileLocalizationsByUserId,
  updateProfileNonLocalized,
  upsertProfileLocalization
} from "../repositories/profiles.repository.js";
import { findSystemSettings } from "../repositories/system-settings.repository.js";
import { findUserById } from "../repositories/users.repository.js";

type Db = NodePgDatabase<typeof schema>;
type LanguageCode = "th" | "en" | "zh";

type Localization = {
  full_name: string;
  position: string;
  department: string;
  bot_location: string;
};

type ProfileResponse = {
  user: {
    id: string;
    email: string;
    role: "employee" | "admin";
    is_active: boolean;
  };
  profile: {
    public_id: string;
    photo_url: string | null;
    email_public: string;
    phone_number: string;
    pref_enable_th: boolean;
    pref_enable_en: boolean;
    pref_enable_zh: boolean;
  };
  enabled_langs: LanguageCode[];
  localizations: Partial<Record<LanguageCode, Localization>>;
};

function parseLangsFilter(langs?: string): LanguageCode[] | null {
  if (!langs) {
    return null;
  }

  const rawItems = langs
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const parsed = rawItems.filter((item): item is LanguageCode => item === "th" || item === "en" || item === "zh");
  if (rawItems.length !== parsed.length) {
    throw new AppError(400, "VALIDATION_ERROR", "langs must contain only th,en,zh");
  }

  return [...new Set(parsed)];
}

function getEnabledLangs(
  profile: { prefEnableTh: boolean; prefEnableEn: boolean; prefEnableZh: boolean },
  settings: { enableTh: boolean; enableEn: boolean; enableZh: boolean } | null
): LanguageCode[] {
  const globalSettings = settings ?? { enableTh: true, enableEn: true, enableZh: true };
  const enabled: LanguageCode[] = [];
  if (profile.prefEnableTh && globalSettings.enableTh) enabled.push("th");
  if (profile.prefEnableEn && globalSettings.enableEn) enabled.push("en");
  if (profile.prefEnableZh && globalSettings.enableZh) enabled.push("zh");
  return enabled;
}

function mapLocalizationRow(row: typeof schema.profileLocalizations.$inferSelect): Localization {
  return {
    full_name: row.fullName,
    position: row.position,
    department: row.department,
    bot_location: row.botLocation
  };
}

function toLocalizationMap(
  rows: Array<typeof schema.profileLocalizations.$inferSelect>,
  langsFilter: LanguageCode[] | null
): Partial<Record<LanguageCode, Localization>> {
  const mapped: Partial<Record<LanguageCode, Localization>> = {};

  for (const row of rows) {
    if (!langsFilter || langsFilter.includes(row.lang)) {
      mapped[row.lang] = mapLocalizationRow(row);
    }
  }

  return mapped;
}

async function buildProfileResponse(db: Db, userId: string, langs?: string): Promise<ProfileResponse> {
  const [user, profile, localizations, settings] = await Promise.all([
    findUserById(db, userId),
    findProfileByUserId(db, userId),
    findProfileLocalizationsByUserId(db, userId),
    findSystemSettings(db)
  ]);

  if (!user || !profile) {
    throw new AppError(404, "NOT_FOUND", "profile not found");
  }

  const langsFilter = parseLangsFilter(langs);

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
    localizations: toLocalizationMap(localizations, langsFilter)
  };
}

export async function getMyProfile(db: Db, input: { userId: string; langs?: string }) {
  return buildProfileResponse(db, input.userId, input.langs);
}

export async function updateMyProfile(
  db: Db,
  input: {
    userId: string;
    emailPublic: string;
    phoneNumber: string;
    prefEnableTh: boolean;
    prefEnableEn: boolean;
    prefEnableZh: boolean;
    localizations: Partial<
      Record<
        LanguageCode,
        {
          full_name: string;
          position: string;
          department: string;
          bot_location: string;
        }
      >
    >;
  }
) {
  const updatedProfile = await updateProfileNonLocalized(db, {
    userId: input.userId,
    emailPublic: input.emailPublic.trim().toLowerCase(),
    phoneNumber: input.phoneNumber,
    prefEnableTh: input.prefEnableTh,
    prefEnableEn: input.prefEnableEn,
    prefEnableZh: input.prefEnableZh
  });

  if (!updatedProfile) {
    throw new AppError(404, "NOT_FOUND", "profile not found");
  }

  const entries = Object.entries(input.localizations).filter(
    (
      entry
    ): entry is [
      LanguageCode,
      {
        full_name: string;
        position: string;
        department: string;
        bot_location: string;
      }
    ] => {
      const value = entry[1];
      return Boolean(value);
    }
  );

  await Promise.all(
    entries.map(([lang, value]) =>
      upsertProfileLocalization(db, {
        userId: input.userId,
        lang,
        fullName: value.full_name,
        position: value.position,
        department: value.department,
        botLocation: value.bot_location
      })
    )
  );

  return buildProfileResponse(db, input.userId);
}
