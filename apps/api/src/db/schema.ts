import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["employee", "admin"]);
export const profileLangEnum = pgEnum("profile_lang", ["th", "en", "zh"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("employee"),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true })
  },
  (t) => ({
    usersEmailUnique: unique("users_email_unique").on(t.email),
    usersIsActiveIdx: index("idx_users_is_active").on(t.isActive)
  })
);

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id")
      .notNull()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: uuid("public_id").notNull().defaultRandom(),
    photoObjectKey: text("photo_object_key"),
    emailPublic: varchar("email_public", { length: 320 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 50 }).notNull().default("-"),
    prefEnableTh: boolean("pref_enable_th").notNull().default(true),
    prefEnableEn: boolean("pref_enable_en").notNull().default(true),
    prefEnableZh: boolean("pref_enable_zh").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    profilesPublicIdUnique: unique("profiles_public_id_unique").on(t.publicId)
  })
);

export const profileLocalizations = pgTable(
  "profile_localizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lang: profileLangEnum("lang").notNull(),
    fullName: varchar("full_name", { length: 200 }).notNull().default("-"),
    position: varchar("position", { length: 200 }).notNull().default("-"),
    department: varchar("department", { length: 200 }).notNull().default("-"),
    botLocation: varchar("bot_location", { length: 200 }).notNull().default("-"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    profileLocalizationsUserLangUnique: unique("uq_profile_localizations_user_lang").on(t.userId, t.lang),
    profileLocalizationsUserIdIdx: index("idx_profile_localizations_user_id").on(t.userId)
  })
);

export const systemSettings = pgTable(
  "system_settings",
  {
    id: integer("id").primaryKey(),
    enableTh: boolean("enable_th").notNull().default(true),
    enableEn: boolean("enable_en").notNull().default(true),
    enableZh: boolean("enable_zh").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    systemSettingsSingleRow: check("system_settings_single_row", sql`${t.id} = 1`)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
