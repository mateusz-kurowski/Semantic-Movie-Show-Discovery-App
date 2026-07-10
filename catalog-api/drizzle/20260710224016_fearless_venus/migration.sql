-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "company" (
	"id" serial PRIMARY KEY,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "country" (
	"id" serial PRIMARY KEY,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword" (
	"id" serial PRIMARY KEY,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language" (
	"id" serial PRIMARY KEY,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie" (
	"id" bigserial PRIMARY KEY,
	"title" varchar,
	"vote_average" double precision NOT NULL,
	"vote_count" integer NOT NULL,
	"status" varchar NOT NULL,
	"release_date" date,
	"revenue" bigint,
	"runtime" integer NOT NULL,
	"adult" boolean NOT NULL,
	"backdrop_path" varchar,
	"budget" bigint,
	"homepage" varchar,
	"imdb_id" varchar,
	"original_language" varchar NOT NULL,
	"original_title" varchar,
	"overview" varchar,
	"popularity" double precision NOT NULL,
	"poster_path" varchar,
	"tagline" varchar,
	"is_present_in_search" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moviecompanylink" (
	"movie_id" integer,
	"company_id" integer,
	CONSTRAINT "moviecompanylink_pkey" PRIMARY KEY("movie_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "moviecountrylink" (
	"movie_id" integer,
	"country_id" integer,
	CONSTRAINT "moviecountrylink_pkey" PRIMARY KEY("movie_id","country_id")
);
--> statement-breakpoint
CREATE TABLE "moviegenrelink" (
	"movie_id" integer,
	"genre_id" integer,
	CONSTRAINT "moviegenrelink_pkey" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "moviekeywordlink" (
	"movie_id" integer,
	"keyword_id" integer,
	CONSTRAINT "moviekeywordlink_pkey" PRIMARY KEY("movie_id","keyword_id")
);
--> statement-breakpoint
CREATE TABLE "movielanguagelink" (
	"movie_id" integer,
	"language_id" integer,
	CONSTRAINT "movielanguagelink_pkey" PRIMARY KEY("movie_id","language_id")
);
--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("id");--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id");--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id");--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id");--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id");--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id");--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id");--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id");--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "keyword"("id");--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id");
*/