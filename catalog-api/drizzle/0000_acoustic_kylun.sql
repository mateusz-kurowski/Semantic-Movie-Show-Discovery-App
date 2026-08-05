CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "usermoviefavorite" (
	"user_id" text NOT NULL,
	"movie_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usermoviefavorite_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "usermovierating" (
	"user_id" text NOT NULL,
	"movie_id" bigint NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usermovierating_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "usermoviewatchlist" (
	"user_id" text NOT NULL,
	"movie_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usermoviewatchlist_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "country" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie" (
	"adult" boolean NOT NULL,
	"backdrop_path" varchar NOT NULL,
	"budget" bigint NOT NULL,
	"homepage" varchar NOT NULL,
	"id" bigserial PRIMARY KEY NOT NULL,
	"imdb_id" varchar NOT NULL,
	"is_present_in_search" boolean NOT NULL,
	"original_language" varchar NOT NULL,
	"original_title" text NOT NULL,
	"overview" text NOT NULL,
	"popularity" double precision NOT NULL,
	"poster_path" varchar NOT NULL,
	"release_date" date,
	"revenue" bigint NOT NULL,
	"runtime" integer NOT NULL,
	"status" varchar NOT NULL,
	"tagline" text NOT NULL,
	"title" text NOT NULL,
	"vote_average" double precision NOT NULL,
	"vote_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moviecompanylink" (
	"company_id" integer NOT NULL,
	"movieId" bigint NOT NULL,
	CONSTRAINT "moviecompanylink_pkey" PRIMARY KEY("movieId","company_id")
);
--> statement-breakpoint
CREATE TABLE "moviecountrylink" (
	"country_id" integer NOT NULL,
	"movieId" bigint NOT NULL,
	CONSTRAINT "moviecountrylink_pkey" PRIMARY KEY("movieId","country_id")
);
--> statement-breakpoint
CREATE TABLE "moviegenrelink" (
	"genre_id" integer NOT NULL,
	"movieId" bigint NOT NULL,
	CONSTRAINT "moviegenrelink_pkey" PRIMARY KEY("movieId","genre_id")
);
--> statement-breakpoint
CREATE TABLE "moviekeywordlink" (
	"keyword_id" integer NOT NULL,
	"movieId" bigint NOT NULL,
	CONSTRAINT "moviekeywordlink_pkey" PRIMARY KEY("movieId","keyword_id")
);
--> statement-breakpoint
CREATE TABLE "movielanguagelink" (
	"language_id" integer NOT NULL,
	"movieId" bigint NOT NULL,
	CONSTRAINT "movielanguagelink_pkey" PRIMARY KEY("movieId","language_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermoviefavorite" ADD CONSTRAINT "usermoviefavorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermoviefavorite" ADD CONSTRAINT "usermoviefavorite_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermovierating" ADD CONSTRAINT "usermovierating_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermovierating" ADD CONSTRAINT "usermovierating_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermoviewatchlist" ADD CONSTRAINT "usermoviewatchlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usermoviewatchlist" ADD CONSTRAINT "usermoviewatchlist_movie_id_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecompanylink" ADD CONSTRAINT "moviecompanylink_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_country_id_country_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviecountrylink" ADD CONSTRAINT "moviecountrylink_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviegenrelink" ADD CONSTRAINT "moviegenrelink_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_keyword_id_keyword_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keyword"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moviekeywordlink" ADD CONSTRAINT "moviekeywordlink_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_language_id_language_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."language"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movielanguagelink" ADD CONSTRAINT "movielanguagelink_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usermoviefavorite_movieId_idx" ON "usermoviefavorite" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "usermovierating_movieId_idx" ON "usermovierating" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "usermoviewatchlist_movieId_idx" ON "usermoviewatchlist" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");