CREATE TABLE "crop_growth_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"progress" integer NOT NULL,
	"health" text NOT NULL,
	"notes" text,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "crop_growth_logs" ADD CONSTRAINT "crop_growth_logs_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;