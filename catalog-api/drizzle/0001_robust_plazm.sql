CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'Nowa konwersacja' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"movie_id" bigint NOT NULL,
	"created_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moviecompanylink" RENAME COLUMN "movieId" TO "movie_id";--> statement-breakpoint
ALTER TABLE "moviecountrylink" RENAME COLUMN "movieId" TO "movie_id";--> statement-breakpoint
ALTER TABLE "moviegenrelink" RENAME COLUMN "movieId" TO "movie_id";--> statement-breakpoint
ALTER TABLE "moviekeywordlink" RENAME COLUMN "movieId" TO "movie_id";--> statement-breakpoint
ALTER TABLE "movielanguagelink" RENAME COLUMN "movieId" TO "movie_id";--> statement-breakpoint
ALTER TABLE "moviecompanylink" DROP CONSTRAINT "moviecompanylink_movieId_movie_id_fk";
--> statement-breakpoint
ALTER TABLE "moviecountrylink" DROP CONSTRAINT "moviecountrylink_movieId_movie_id_fk";
--> statement-breakpoint
ALTER TABLE "moviegenrelink" DROP CONSTRAINT "moviegenrelink_movieId_movie_id_fk";
--> statement-breakpoint
ALTER TABLE "moviekeywordlink" DROP CONSTRAINT "moviekeywordlink_movieId_movie_id_fk";
--> statement-breakpoint
ALTER TABLE "movielanguagelink" DROP CONSTRAINT "movielanguagelink_movieId_movie_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecompanylink" DROP CONSTRAINT "moviecompanylink_pkey";
--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_pkey" PRIMARY KEY("movie_id","company_id");--> statement-breakpoint
ALTER TABLE "moviecountrylink" DROP CONSTRAINT "moviecountrylink_pkey";
--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_pkey" PRIMARY KEY("movie_id","country_id");--> statement-breakpoint
ALTER TABLE "moviegenrelink" DROP CONSTRAINT "moviegenrelink_pkey";
--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_pkey" PRIMARY KEY("movie_id","genre_id");--> statement-breakpoint
ALTER TABLE "moviekeywordlink" DROP CONSTRAINT "moviekeywordlink_pkey";
--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_pkey" PRIMARY KEY("movie_id","keyword_id");--> statement-breakpoint
ALTER TABLE "movielanguagelink" DROP CONSTRAINT "movielanguagelink_pkey";
--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_pkey" PRIMARY KEY("movie_id","language_id");