CREATE TABLE IF NOT EXISTS "generated_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generated_date" timestamp DEFAULT now() NOT NULL,
	"template_id" uuid NOT NULL,
	"data_value" jsonb
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_templates" ADD CONSTRAINT "generated_templates_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
