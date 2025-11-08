CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"url" text NOT NULL,
	"client_secret" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_client_id_users_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("client_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
