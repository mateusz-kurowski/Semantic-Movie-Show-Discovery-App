import {
  bigint,
  bigserial,
  boolean,
  date,
  doublePrecision,
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
  adult: boolean().notNull(),
  backdrop_path: varchar("backdrop_path"),
  budget: bigint({ mode: "number" }),
  homepage: varchar(),
  id: bigserial({ mode: "number" }).primaryKey(),
  imdb_id: varchar("imdb_id"),
  is_present_in_search: boolean("is_present_in_search").notNull(),
  original_language: varchar("original_language").notNull(),
  original_title: varchar("original_title").notNull(),
  overview: varchar().notNull(),
  popularity: doublePrecision().notNull(),
  poster_path: varchar("poster_path"),
  release_date: date("release_date"),
  revenue: bigint({ mode: "number" }),
  runtime: integer().notNull(),
  status: varchar().notNull(),
  tagline: varchar(),
  title: varchar(),
  vote_average: doublePrecision("vote_average").notNull(),
  vote_count: integer("vote_count").notNull(),
});

export const moviecompanylink = pgTable(
  "moviecompanylink",
  {
    companyId: integer("company_id")
      .notNull()
      .references(() => company.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
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
    countryId: integer("country_id")
      .notNull()
      .references(() => country.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
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
    genreId: integer("genre_id")
      .notNull()
      .references(() => genre.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
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
    keywordId: integer("keyword_id")
      .notNull()
      .references(() => keyword.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
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
    languageId: integer("language_id")
      .notNull()
      .references(() => language.id),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movie.id),
  },
  (table) => [
    primaryKey({
      columns: [table.movieId, table.languageId],
      name: "movielanguagelink_pkey",
    }),
  ],
);

export const _movieSelectSchema = createSelectSchema(movie);
