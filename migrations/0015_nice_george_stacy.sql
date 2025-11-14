CREATE TYPE "public"."pdf_generation_type" AS ENUM('ASYNC', 'SYNC');--> statement-breakpoint
ALTER TABLE "generated_templates" ADD COLUMN "generated_pdf_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "generated_templates" ADD COLUMN "inngest_job_id" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_templates" ADD COLUMN "pdf_generation_type" "pdf_generation_type" DEFAULT 'SYNC';--> statement-breakpoint
ALTER TABLE "generated_templates" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_templates" ADD COLUMN "completed_at" timestamp;