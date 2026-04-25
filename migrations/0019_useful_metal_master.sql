ALTER TABLE "template_gallery" DROP CONSTRAINT "template_gallery_title_unique";--> statement-breakpoint
ALTER TABLE "template_gallery" ADD COLUMN "type_key" varchar(255);--> statement-breakpoint
ALTER TABLE "template_gallery" ADD COLUMN "variant_name" varchar(255);--> statement-breakpoint
UPDATE "template_gallery" SET "type_key" = LOWER(REPLACE(REPLACE("title", ' ', '-'), '/', '-'));--> statement-breakpoint
ALTER TABLE "template_gallery" ALTER COLUMN "type_key" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tg_type_key_unique" ON "template_gallery" USING btree ("type_key");
