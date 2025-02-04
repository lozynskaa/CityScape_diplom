ALTER TABLE "work-diplom_company" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "work-diplom_user" ADD COLUMN "onboarding_completed" boolean DEFAULT false;