CREATE TYPE "public"."environment" AS ENUM('prod', 'dev');--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "environment" "environment" DEFAULT 'dev' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;