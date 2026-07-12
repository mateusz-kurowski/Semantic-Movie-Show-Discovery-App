import { relations } from "drizzle-orm";
import {
  company,
  country,
  genre,
  keyword,
  language,
  movie,
  moviecompanylink,
  moviecountrylink,
  moviegenrelink,
  moviekeywordlink,
  movielanguagelink,
} from "./catalog-schema";

// Junction table relations
export const moviecompanylinkRelations = relations(moviecompanylink, ({ one }) => ({
  company: one(company, {
    fields: [moviecompanylink.companyId],
    references: [company.id],
  }),
  movie: one(movie, {
    fields: [moviecompanylink.movieId],
    references: [movie.id],
  }),
}));

export const moviecountrylinkRelations = relations(moviecountrylink, ({ one }) => ({
  country: one(country, {
    fields: [moviecountrylink.countryId],
    references: [country.id],
  }),
  movie: one(movie, {
    fields: [moviecountrylink.movieId],
    references: [movie.id],
  }),
}));

export const moviegenrelinkRelations = relations(moviegenrelink, ({ one }) => ({
  genre: one(genre, {
    fields: [moviegenrelink.genreId],
    references: [genre.id],
  }),
  movie: one(movie, {
    fields: [moviegenrelink.movieId],
    references: [movie.id],
  }),
}));

export const moviekeywordlinkRelations = relations(moviekeywordlink, ({ one }) => ({
  keyword: one(keyword, {
    fields: [moviekeywordlink.keywordId],
    references: [keyword.id],
  }),
  movie: one(movie, {
    fields: [moviekeywordlink.movieId],
    references: [movie.id],
  }),
}));

export const movielanguagelinkRelations = relations(movielanguagelink, ({ one }) => ({
  language: one(language, {
    fields: [movielanguagelink.languageId],
    references: [language.id],
  }),
  movie: one(movie, {
    fields: [movielanguagelink.movieId],
    references: [movie.id],
  }),
}));

// Entity relations (through junction tables)
export const companyRelations = relations(company, ({ many }) => ({
  moviecompanylinks: many(moviecompanylink),
}));

export const countryRelations = relations(country, ({ many }) => ({
  moviecountrylinks: many(moviecountrylink),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  moviegenrelinks: many(moviegenrelink),
}));

export const keywordRelations = relations(keyword, ({ many }) => ({
  moviekeywordlinks: many(moviekeywordlink),
}));

export const languageRelations = relations(language, ({ many }) => ({
  movielanguagelinks: many(movielanguagelink),
}));

export const movieRelations = relations(movie, ({ many }) => ({
  moviecompanylinks: many(moviecompanylink),
  moviecountrylinks: many(moviecountrylink),
  moviegenrelinks: many(moviegenrelink),
  moviekeywordlinks: many(moviekeywordlink),
  movielanguagelinks: many(movielanguagelink),
}));
