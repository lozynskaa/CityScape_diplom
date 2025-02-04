ALTER TABLE "work-diplom_company" ADD COLUMN "okpo" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "phone" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "liqpay_public_key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "liqpay_private_key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_donation" ADD COLUMN "status" varchar(10) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_donation" DROP COLUMN IF EXISTS "braintree_status";--> statement-breakpoint
ALTER TABLE "work-diplom_donation" DROP COLUMN IF EXISTS "wise_status";