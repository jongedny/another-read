CREATE TABLE "Demo App_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"description" text,
	"isbn" text,
	"publication_date" text,
	"keywords" text,
	"price" text,
	"genre" text,
	"cover_image_url" text,
	"status" text,
	"external_id" text,
	"created_by" text,
	"is_sample" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Demo App_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
