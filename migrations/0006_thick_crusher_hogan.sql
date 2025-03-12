CREATE TABLE IF NOT EXISTS "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"credits" integer NOT NULL,
	"credited_at" timestamp DEFAULT now() NOT NULL,
	"payment_id" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "remaining_balance" integer DEFAULT 150 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_client_id_users_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("client_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
