import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	company: {
		movies: r.many.movie({
			from: r.company.id.through(r.moviecompanylink.companyId),
			to: r.movie.id.through(r.moviecompanylink.movieId)
		}),
	},
	movie: {
		companies: r.many.company(),
		countries: r.many.country(),
		genres: r.many.genre(),
		keywords: r.many.keyword(),
		languages: r.many.language(),
	},
	country: {
		movies: r.many.movie({
			from: r.country.id.through(r.moviecountrylink.countryId),
			to: r.movie.id.through(r.moviecountrylink.movieId)
		}),
	},
	genre: {
		movies: r.many.movie({
			from: r.genre.id.through(r.moviegenrelink.genreId),
			to: r.movie.id.through(r.moviegenrelink.movieId)
		}),
	},
	keyword: {
		movies: r.many.movie({
			from: r.keyword.id.through(r.moviekeywordlink.keywordId),
			to: r.movie.id.through(r.moviekeywordlink.movieId)
		}),
	},
	language: {
		movies: r.many.movie({
			from: r.language.id.through(r.movielanguagelink.languageId),
			to: r.movie.id.through(r.movielanguagelink.movieId)
		}),
	},
}))