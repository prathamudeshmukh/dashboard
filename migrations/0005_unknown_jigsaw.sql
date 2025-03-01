CREATE INDEX IF NOT EXISTS "generated_templates_generated_date_idx" ON "generated_templates" USING btree ("generated_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generated_templates_template_id_idx" ON "generated_templates" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "template_email_idx" ON "templates" USING btree ("email");