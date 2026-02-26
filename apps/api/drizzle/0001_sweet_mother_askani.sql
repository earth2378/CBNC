CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_th" varchar(200) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_zh" varchar(200) NOT NULL,
	"address_th" varchar(500),
	"address_en" varchar(500),
	"address_zh" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "locations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_localizations" DROP COLUMN "bot_location";