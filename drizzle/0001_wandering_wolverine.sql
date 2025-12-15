CREATE TABLE "Another Read_api_key" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"user_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Another Read_api_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "Another Read_book" (
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
CREATE TABLE "Another Read_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"related_book_ids" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_credit_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"operation" text NOT NULL,
	"tokens_used" integer NOT NULL,
	"credits_deducted" integer NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_event_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"match_score" integer,
	"ai_score" integer,
	"ai_explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"keywords" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_import_error" (
	"id" serial PRIMARY KEY NOT NULL,
	"import_log_id" integer NOT NULL,
	"book_identifier" text,
	"error_type" text NOT NULL,
	"error_message" text NOT NULL,
	"error_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_import_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"filepath" text NOT NULL,
	"status" text NOT NULL,
	"total_books" integer DEFAULT 0,
	"imported_books" integer DEFAULT 0,
	"skipped_books" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"import_source" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Another Read_password_reset_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Another Read_password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Another Read_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"user_tier" text DEFAULT 'User' NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"credit_quota" integer DEFAULT 0 NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Another Read_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "Demo App_book" CASCADE;--> statement-breakpoint
DROP TABLE "Demo App_event" CASCADE;--> statement-breakpoint
ALTER TABLE "Another Read_api_key" ADD CONSTRAINT "Another Read_api_key_user_id_Another Read_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Another Read_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_content" ADD CONSTRAINT "Another Read_content_event_id_Another Read_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Another Read_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_credit_usage" ADD CONSTRAINT "Another Read_credit_usage_user_id_Another Read_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Another Read_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_event_book" ADD CONSTRAINT "Another Read_event_book_event_id_Another Read_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Another Read_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_event_book" ADD CONSTRAINT "Another Read_event_book_book_id_Another Read_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."Another Read_book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_import_error" ADD CONSTRAINT "Another Read_import_error_import_log_id_Another Read_import_log_id_fk" FOREIGN KEY ("import_log_id") REFERENCES "public"."Another Read_import_log"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Another Read_password_reset_token" ADD CONSTRAINT "Another Read_password_reset_token_user_id_Another Read_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Another Read_user"("id") ON DELETE no action ON UPDATE no action;