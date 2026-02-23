import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";
import { AppError } from "../lib/errors.js";
import {
  findProfileByPublicId,
  findProfileLocalizationByUserIdAndLang,
  findProfileLocalizationsByUserId
} from "../repositories/profiles.repository.js";
import { findSystemSettings } from "../repositories/system-settings.repository.js";

type Db = NodePgDatabase<typeof schema>;
type LanguageCode = "th" | "en" | "zh";

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
  const enabled: LanguageCode[] = [];
  if (profile.prefEnableTh && globalSettings.enableTh) enabled.push("th");
  if (profile.prefEnableEn && globalSettings.enableEn) enabled.push("en");
  if (profile.prefEnableZh && globalSettings.enableZh) enabled.push("zh");
  return enabled;
}

function mapLocalizationRow(row: typeof schema.profileLocalizations.$inferSelect | null): Localization {
  if (!row) {
    return {
      full_name: "-",
      position: "-",
      department: "-",
      bot_location: "-"
    };
  }

  return {
    full_name: row.fullName,
    position: row.position,
    department: row.department,
    bot_location: row.botLocation
  };
}

function toLocalizationMap(
  rows: Array<typeof schema.profileLocalizations.$inferSelect>,
  enabledLangs: LanguageCode[]
) {
  const mapped: Partial<Record<LanguageCode, Localization>> = {};
  const allowed = new Set(enabledLangs);

  for (const row of rows) {
    if (allowed.has(row.lang)) {
      mapped[row.lang] = mapLocalizationRow(row);
    }
  }

  return mapped;
}

export async function getPublicProfile(db: Db, input: { publicId: string; lang?: LanguageCode }) {
  const profile = await findProfileByPublicId(db, input.publicId);
  if (!profile) {
    throw new AppError(404, "NOT_FOUND", "public profile not found");
  }

  const settings = await findSystemSettings(db);
  const enabledLangs = getEnabledLangs(profile, settings);
  if (input.lang && !enabledLangs.includes(input.lang)) {
    throw new AppError(404, "NOT_FOUND", "language not available");
  }
  let localizations: Array<typeof schema.profileLocalizations.$inferSelect> = [];

  if (input.lang) {
    const row = await findProfileLocalizationByUserIdAndLang(db, profile.userId, input.lang);
    if (row) {
      localizations = [row];
    }
  } else {
    localizations = await findProfileLocalizationsByUserId(db, profile.userId);
  }

  return {
    profile: {
      public_id: profile.publicId,
      photo_url: null,
      email_public: profile.emailPublic,
      phone_number: profile.phoneNumber
    },
    enabled_langs: enabledLangs,
    localizations: input.lang
      ? {
          [input.lang]: mapLocalizationRow(localizations[0] ?? null)
        }
      : toLocalizationMap(localizations, enabledLangs)
  };
}
