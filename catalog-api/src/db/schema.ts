import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  date,
  doublePrecision,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";

export const company = pgTable("company", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
});

export const country = pgTable("country", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
});

export const genre = pgTable("genre", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
});

export const keyword = pgTable("keyword", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
});

export const language = pgTable("language", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
});

export const movie = pgTable("movie", {
  id: bigserial({ mode: "number" }).primaryKey(),
  title: varchar(),
  voteAverage: doublePrecision("vote_average").notNull(),
  voteCount: integer("vote_count").notNull(),
  status: varchar().notNull(),
  releaseDate: date("release_date"),
  revenue: bigint({ mode: "number" }),
  runtime: integer().notNull(),
  adult: boolean().notNull(),
  backdropPath: varchar("backdrop_path"),
  budget: bigint({ mode: "number" }),
  homepage: varchar(),
  imdbId: varchar("imdb_id"),
  originalLanguage: varchar("original_language").notNull(),
  originalTitle: varchar("original_title").notNull(),
  overview: varchar().notNull(),
  popularity: doublePrecision().notNull(),
  posterPath: varchar("poster_path"),
  tagline: varchar(),
  isPresentInSearch: boolean("is_present_in_search").notNull(),
});

export const moviecompanylink = pgTable(
  "moviecompanylink",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
    companyId: integer("company_id")
      .notNull()
      .references(() => company.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.companyId],
      name: "moviecompanylink_pkey",
    }),
  ],
);

export const moviecountrylink = pgTable(
  "moviecountrylink",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
    countryId: integer("country_id")
      .notNull()
      .references(() => country.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.countryId],
      name: "moviecountrylink_pkey",
    }),
  ],
);

export const moviegenrelink = pgTable(
  "moviegenrelink",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genre.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.genreId],
      name: "moviegenrelink_pkey",
    }),
  ],
);

export const moviekeywordlink = pgTable(
  "moviekeywordlink",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
    keywordId: integer("keyword_id")
      .notNull()
      .references(() => keyword.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.keywordId],
      name: "moviekeywordlink_pkey",
    }),
  ],
);

export const movielanguagelink = pgTable(
  "movielanguagelink",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
    languageId: integer("language_id")
      .notNull()
      .references(() => language.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.languageId],
      name: "movielanguagelink_pkey",
    }),
  ],
);

export const _movieSelectSchema = createSelectSchema(movie);
