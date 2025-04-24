-- Create the enum type
CREATE TYPE "creation_method" AS ENUM ('EXTRACT_FROM_PDF', 'TEMPLATE_GALLERY', 'NEW_TEMPLATE');

-- Create template_gallery table
CREATE TABLE IF NOT EXISTS "template_gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"color" varchar(255),
	"category" varchar(255),
	"html_content" text NOT NULL,
	"handlebar_content" text,
	"style" text
);
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "creation_method" "creation_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "template_generated_from" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "templates" ADD CONSTRAINT "templates_template_generated_from_template_gallery_id_fk" FOREIGN KEY ("template_generated_from") REFERENCES "public"."template_gallery"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
