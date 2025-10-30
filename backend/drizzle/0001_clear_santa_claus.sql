CREATE TABLE "crops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"stage" text DEFAULT 'Land Preparation',
	"progress" integer DEFAULT 10,
	"health" text DEFAULT 'Healthy',
	"expected_harvest_date" timestamp,
	"contract_id" text,
	"on_chain_verified" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;