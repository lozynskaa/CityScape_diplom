ALTER TABLE "work-diplom_company" ADD COLUMN "date_of_birth" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "first_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "last_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" ADD COLUMN "country" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "work-diplom_company" DROP COLUMN IF EXISTS "merchant_account";--> statement-breakpoint
ALTER TABLE "work-diplom_company" DROP COLUMN IF EXISTS "merchant_secret";