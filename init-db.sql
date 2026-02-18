-- PostgreSQL schema for Phase 1 prototype (UPDATED: user-level language preferences)
-- Key points:
-- - profiles: 1 row per user (public identity + non-localized fields + language preference flags)
-- - profile_localizations: 1 row per (user, lang) (localized fields)
-- - system_settings: optional global language availability (kept); UI should use intersection:
--       available = system_settings.enable_*
--       enabled_for_user = profiles.pref_enable_*

-- - "is_active" default is TBD (choose TRUE for auto-activate, FALSE for admin-activate)
-- - Uses UUIDs; enable pgcrypto for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('employee', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_lang') THEN
    CREATE TYPE profile_lang AS ENUM ('th', 'en', 'zh');
  END IF;
END$$;

-- 2) Users (auth + role + activation)
CREATE TABLE IF NOT EXISTS users (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  email           varchar(320)  NOT NULL UNIQUE,
  password_hash   text         NOT NULL,
  role            user_role    NOT NULL DEFAULT 'employee',
  is_active       boolean      NOT NULL DEFAULT false, -- TBD: set true if auto-activate
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  last_login_at   timestamptz  NULL
);

-- 3) Profiles (public link identity + non-localized fields + per-user language preferences)
CREATE TABLE IF NOT EXISTS profiles (
  user_id            uuid         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  public_id          uuid         NOT NULL UNIQUE DEFAULT gen_random_uuid(), -- stable public link ID for QR
  photo_object_key   text         NULL,
  email_public       varchar(320) NOT NULL,
  phone_number       varchar(50)  NOT NULL DEFAULT '-',

  -- Per-user language preferences (enable/disable languages for editing/display)
  pref_enable_th     boolean      NOT NULL DEFAULT true,
  pref_enable_en     boolean      NOT NULL DEFAULT true,
  pref_enable_zh     boolean      NOT NULL DEFAULT true,

  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now()
);

-- 4) Profile localizations (TH/EN/ZH localized fields)
CREATE TABLE IF NOT EXISTS profile_localizations (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lang          profile_lang NOT NULL,

  full_name     varchar(200) NOT NULL DEFAULT '-',
  position      varchar(200) NOT NULL DEFAULT '-',
  department    varchar(200) NOT NULL DEFAULT '-',
  bot_location  varchar(200) NOT NULL DEFAULT '-',

  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT uq_profile_localizations_user_lang UNIQUE (user_id, lang)
);

-- 5) Global language availability flags (optional but useful)
-- If you don't want any global control, you can remove this table.
CREATE TABLE IF NOT EXISTS system_settings (
  id          int          PRIMARY KEY CHECK (id = 1),
  enable_th   boolean      NOT NULL DEFAULT true,
  enable_en   boolean      NOT NULL DEFAULT true,
  enable_zh   boolean      NOT NULL DEFAULT true,
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- Ensure there is always exactly one row (id=1)
INSERT INTO system_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Helpful indexes (prototype minimum)
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_profile_localizations_user_id ON profile_localizations(user_id);

-- OPTIONAL (recommended): keep updated_at fresh automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profile_localizations_updated_at ON profile_localizations;
CREATE TRIGGER trg_profile_localizations_updated_at
BEFORE UPDATE ON profile_localizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON system_settings;
CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
