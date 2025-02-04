DROP TABLE "work-diplom_company_merchant";--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "iban" varchar(34) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_donation" ADD COLUMN "wise_status" varchar(10) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" DROP COLUMN IF EXISTS "company_merchant_id";--> statement-breakpoint
ALTER TABLE "work-diplom_donation" DROP COLUMN IF EXISTS "status";