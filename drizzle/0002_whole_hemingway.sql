CREATE TABLE "Another Read_book_contributor" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"contributor_id" integer NOT NULL,
	"role" text NOT NULL,
	"sequence_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_contributor" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"biography" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Another Read_book" ADD COLUMN "contributor_ids" text;--> statement-breakpoint
ALTER TABLE "Another Read_event" ADD COLUMN "event_date" timestamp;--> statement-breakpoint
ALTER TABLE "Another Read_book_contributor" ADD CONSTRAINT "Another Read_book_contributor_book_id_Another Read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."Another Read_book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_book_contributor" ADD CONSTRAINT "Another Read_book_contributor_contributor_id_Another Read_contributor_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."Another Read_contributor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_book" DROP COLUMN "author";