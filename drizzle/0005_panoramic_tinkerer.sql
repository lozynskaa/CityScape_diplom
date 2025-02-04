CREATE TABLE IF NOT EXISTS "work-diplom_company_merchant" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"company_id" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"ssn" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(255),
	"date_of_birth" timestamp with time zone,
	"street_address" varchar(255),
	"locality" varchar(255),
	"region" varchar(255),
	"postal_code" varchar(255),
	"account_number" varchar(4),
	"routing_number" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"braintree_linked" boolean DEFAULT false
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work-diplom_company_merchant" ADD CONSTRAINT "work-diplom_company_merchant_company_id_work-diplom_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."work-diplom_company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
