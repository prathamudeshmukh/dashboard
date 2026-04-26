DROP INDEX IF EXISTS "tg_type_key_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tg_type_variant_unique" ON "template_gallery" USING btree ("type_key","variant_name");