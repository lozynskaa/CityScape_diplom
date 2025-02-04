ALTER TABLE "work-diplom_company" RENAME COLUMN "braintree_account_id" TO "company_merchant_id";--> statement-breakpoint
ALTER TABLE "work-diplom_company" DROP COLUMN IF EXISTS "braintree_linked";