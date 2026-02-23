CREATE TYPE "public"."profile_lang" AS ENUM('th', 'en', 'zh');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employee', 'admin');--> statement-breakpoint
CREATE TABLE "profile_localizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lang" "profile_lang" NOT NULL,
	"full_name" varchar(200) DEFAULT '-' NOT NULL,
	"position" varchar(200) DEFAULT '-' NOT NULL,
	"department" varchar(200) DEFAULT '-' NOT NULL,
	"bot_location" varchar(200) DEFAULT '-' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_profile_localizations_user_lang" UNIQUE("user_id","lang")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"photo_object_key" text,
	"email_public" varchar(320) NOT NULL,
	"phone_number" varchar(50) DEFAULT '-' NOT NULL,
	"pref_enable_th" boolean DEFAULT true NOT NULL,
	"pref_enable_en" boolean DEFAULT true NOT NULL,
	"pref_enable_zh" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"enable_th" boolean DEFAULT true NOT NULL,
	"enable_en" boolean DEFAULT true NOT NULL,
	"enable_zh" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_single_row" CHECK ("system_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profile_localizations" ADD CONSTRAINT "profile_localizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profile_localizations_user_id" ON "profile_localizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");
