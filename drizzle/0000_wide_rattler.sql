DO $$ BEGIN
 CREATE TYPE "public"."donation_type" AS ENUM('cash', 'card', 'crypto');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "work-diplom_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_company" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"founder_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"website" varchar(255),
	"email" varchar(255) NOT NULL,
	"image_url" varchar(255),
	"category" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_company_user" (
	"user_id" varchar(255) NOT NULL,
	"company_id" varchar(255) NOT NULL,
	"role" varchar(50),
	CONSTRAINT "work-diplom_company_user_user_id_company_id_pk" PRIMARY KEY("user_id","company_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_donation" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"jar_id" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"donation_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"donation_type" "donation_type" NOT NULL,
	"receipt_url" varchar(255),
	"transaction_id" varchar(255),
	"currency" varchar(10) DEFAULT 'USD'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_jar" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"company_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"goal_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(255),
	"purpose" varchar(255),
	"image_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_post" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"company_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"images" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"profile_photo" varchar(255),
	"bio" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"onboarding_completed" boolean DEFAULT false,
	"image" varchar(255),
	"email_verified" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work-diplom_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "work-diplom_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_account" ADD CONSTRAINT "work-diplom_account_user_id_work-diplom_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."work-diplom_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_company" ADD CONSTRAINT "work-diplom_company_founder_id_work-diplom_user_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."work-diplom_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_company_user" ADD CONSTRAINT "work-diplom_company_user_user_id_work-diplom_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."work-diplom_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_company_user" ADD CONSTRAINT "work-diplom_company_user_company_id_work-diplom_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."work-diplom_company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_donation" ADD CONSTRAINT "work-diplom_donation_user_id_work-diplom_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."work-diplom_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_donation" ADD CONSTRAINT "work-diplom_donation_jar_id_work-diplom_jar_id_fk" FOREIGN KEY ("jar_id") REFERENCES "public"."work-diplom_jar"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_jar" ADD CONSTRAINT "work-diplom_jar_company_id_work-diplom_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."work-diplom_company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_post" ADD CONSTRAINT "work-diplom_post_company_id_work-diplom_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."work-diplom_company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "work-diplom_account" USING btree ("user_id");